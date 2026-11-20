import Foundation
import Capacitor
import HealthKit

/// LIBRE – lecture de Santé Apple (HealthKit), en lecture seule.
///
/// Côté JavaScript : `window.Capacitor.Plugins.LibreHealth`
///   isAvailable()                         -> { available: Bool }
///   requestAuthorization({ read: [clé] }) -> { requested: Bool }
///   queryDaily({ from, to, read })        -> { days: [{ date: "AAAA-MM-JJ", steps?, sleep?, … }] }
///
/// Clés : steps, distance (km), exercise (min), energy (kcal), hr, hrRest (bpm),
///        hrv (ms, SDNN), resp (/min), sleep (heures).
/// Les valeurs sont résumées par jour (somme ou moyenne). Rien n’est écrit dans Santé.
@objc(LibreHealthPlugin)
public class LibreHealthPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "LibreHealthPlugin"
    public let jsName = "LibreHealth"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "isAvailable", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "requestAuthorization", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "queryDaily", returnType: CAPPluginReturnPromise)
    ]

    private let store = HKHealthStore()
    private let lock = NSLock()

    private struct QSpec { let type: HKQuantityType; let unit: HKUnit; let options: HKStatisticsOptions; let average: Bool }

    private func quantitySpec(_ key: String) -> QSpec? {
        let perMin = HKUnit.count().unitDivided(by: HKUnit.minute())
        func q(_ id: HKQuantityTypeIdentifier) -> HKQuantityType? { HKObjectType.quantityType(forIdentifier: id) }
        switch key {
        case "steps":    return q(.stepCount).map { QSpec(type: $0, unit: .count(), options: .cumulativeSum, average: false) }
        case "distance": return q(.distanceWalkingRunning).map { QSpec(type: $0, unit: .meterUnit(with: .kilo), options: .cumulativeSum, average: false) }
        case "exercise": return q(.appleExerciseTime).map { QSpec(type: $0, unit: .minute(), options: .cumulativeSum, average: false) }
        case "energy":   return q(.activeEnergyBurned).map { QSpec(type: $0, unit: .kilocalorie(), options: .cumulativeSum, average: false) }
        case "hr":       return q(.heartRate).map { QSpec(type: $0, unit: perMin, options: .discreteAverage, average: true) }
        case "hrRest":   return q(.restingHeartRate).map { QSpec(type: $0, unit: perMin, options: .discreteAverage, average: true) }
        case "hrv":      return q(.heartRateVariabilitySDNN).map { QSpec(type: $0, unit: .secondUnit(with: .milli), options: .discreteAverage, average: true) }
        case "resp":     return q(.respiratoryRate).map { QSpec(type: $0, unit: perMin, options: .discreteAverage, average: true) }
        default: return nil
        }
    }

    private func readTypes(_ keys: [String]) -> Set<HKObjectType> {
        var set = Set<HKObjectType>()
        for k in keys {
            if k == "sleep" { if let s = HKObjectType.categoryType(forIdentifier: .sleepAnalysis) { set.insert(s) } }
            else if let spec = quantitySpec(k) { set.insert(spec.type) }
        }
        return set
    }

    private let dayFormatter: DateFormatter = {
        let f = DateFormatter()
        f.calendar = Calendar(identifier: .gregorian)
        f.locale = Locale(identifier: "en_US_POSIX")
        f.timeZone = TimeZone.current
        f.dateFormat = "yyyy-MM-dd"
        return f
    }()

    private func parseISO(_ s: String?) -> Date? {
        guard let s = s else { return nil }
        let f = ISO8601DateFormatter()
        f.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        if let d = f.date(from: s) { return d }
        f.formatOptions = [.withInternetDateTime]
        return f.date(from: s)
    }

    @objc func isAvailable(_ call: CAPPluginCall) {
        call.resolve(["available": HKHealthStore.isHealthDataAvailable()])
    }

    @objc func requestAuthorization(_ call: CAPPluginCall) {
        guard HKHealthStore.isHealthDataAvailable() else { call.reject("Santé n’est pas disponible sur cet appareil", "UNAVAILABLE"); return }
        let keys = call.getArray("read", String.self) ?? []
        let types = readTypes(keys)
        guard !types.isEmpty else { call.reject("Aucune donnée demandée", "EMPTY"); return }
        // Lecture seule : toShare vide. iOS affiche sa propre feuille d’autorisation.
        store.requestAuthorization(toShare: [], read: types) { success, error in
            if let error = error { call.reject(error.localizedDescription, "AUTH_ERROR"); return }
            // success indique que la demande a été présentée, pas que la lecture est accordée :
            // iOS ne révèle jamais un refus de lecture (protection de la vie privée).
            call.resolve(["requested": success])
        }
    }

    @objc func queryDaily(_ call: CAPPluginCall) {
        guard HKHealthStore.isHealthDataAvailable() else { call.reject("Santé n’est pas disponible sur cet appareil", "UNAVAILABLE"); return }
        guard let from = parseISO(call.getString("from")), let to = parseISO(call.getString("to")), from < to else { call.reject("Période invalide", "BAD_RANGE"); return }
        let keys = call.getArray("read", String.self) ?? []
        let cal = Calendar.current
        let start = cal.startOfDay(for: from)
        var days: [String: [String: Double]] = [:]
        var errors: [String] = []
        let group = DispatchGroup()

        func put(_ date: Date, _ key: String, _ value: Double) {
            lock.lock(); defer { lock.unlock() }
            let k = dayFormatter.string(from: date)
            var d = days[k] ?? [:]
            d[key] = value
            days[k] = d
        }

        for key in keys where key != "sleep" {
            guard let spec = quantitySpec(key) else { continue }
            group.enter()
            let pred = HKQuery.predicateForSamples(withStart: start, end: to, options: .strictStartDate)
            let q = HKStatisticsCollectionQuery(quantityType: spec.type, quantitySamplePredicate: pred, options: spec.options, anchorDate: start, intervalComponents: DateComponents(day: 1))
            q.initialResultsHandler = { _, results, error in
                defer { group.leave() }
                if let error = error {
                    // Sans autorisation ou sans données, HealthKit peut renvoyer une erreur ou rien : on continue.
                    self.lock.lock(); errors.append("\(key): \(error.localizedDescription)"); self.lock.unlock()
                    return
                }
                results?.enumerateStatistics(from: start, to: to) { stat, _ in
                    let quantity = spec.average ? stat.averageQuantity() : stat.sumQuantity()
                    if let v = quantity?.doubleValue(for: spec.unit) { put(stat.startDate, key, v) }
                }
            }
            store.execute(q)
        }

        if keys.contains("sleep"), let sleepType = HKObjectType.categoryType(forIdentifier: .sleepAnalysis) {
            group.enter()
            // Nuit précédente comprise : on part de 18 h la veille du premier jour.
            let sleepStart = cal.date(byAdding: .hour, value: -6, to: start) ?? start
            let pred = HKQuery.predicateForSamples(withStart: sleepStart, end: to, options: [])
            let q = HKSampleQuery(sampleType: sleepType, predicate: pred, limit: HKObjectQueryNoLimit, sortDescriptors: nil) { _, samples, error in
                defer { group.leave() }
                if let error = error { self.lock.lock(); errors.append("sleep: \(error.localizedDescription)"); self.lock.unlock(); return }
                // Phases « endormi » uniquement (pas « au lit » ni « éveillé »). Les intervalles qui se chevauchent
                // (iPhone + Apple Watch) sont fusionnés pour ne pas compter deux fois la même nuit.
                var byDay: [String: [(Date, Date)]] = [:]
                for case let s as HKCategorySample in samples ?? [] {
                    guard let v = HKCategoryValueSleepAnalysis(rawValue: s.value) else { continue }
                    if v == .inBed || v == .awake { continue }
                    let k = self.dayFormatter.string(from: s.endDate) // la nuit compte pour le jour du réveil
                    byDay[k, default: []].append((s.startDate, s.endDate))
                }
                for (k, intervals) in byDay {
                    let sorted = intervals.sorted { $0.0 < $1.0 }
                    var total: TimeInterval = 0
                    var cur: (Date, Date)? = nil
                    for iv in sorted {
                        if let c = cur, iv.0 <= c.1 { cur = (c.0, max(c.1, iv.1)) }
                        else { if let c = cur { total += c.1.timeIntervalSince(c.0) }; cur = iv }
                    }
                    if let c = cur { total += c.1.timeIntervalSince(c.0) }
                    if let d = self.dayFormatter.date(from: k), d >= start { put(d, "sleep", total / 3600.0) }
                }
            }
            store.execute(q)
        }

        group.notify(queue: .main) {
            let list: [[String: Any]] = days.keys.sorted().map { k in
                var row: [String: Any] = ["date": k]
                for (key, v) in days[k] ?? [:] { row[key] = v }
                return row
            }
            call.resolve(["days": list, "errors": errors])
        }
    }
}
