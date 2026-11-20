import Foundation
import Capacitor
import CryptoKit
import Security

/// LIBRE – coffre de données chiffré (iOS).
///
/// Les données de l’app (texte JSON) sont enregistrées dans Application Support/LibreVault/NOM.bin,
/// chiffrées en AES-256-GCM (CryptoKit). La clé de 256 bits est créée au premier usage et rangée dans
/// le trousseau iOS (kSecAttrAccessibleAfterFirstUnlock) : elle est transférée avec les sauvegardes
/// iCloud ou les sauvegardes chiffrées de l’ordinateur, jamais avec une sauvegarde non chiffrée.
/// Les fichiers ont en plus la protection de données iOS (completeUntilFirstUserAuthentication).
///
/// Format : 1 octet de version (1) + nonce (12) + texte chiffré + étiquette (16). Écriture atomique.
///
/// JavaScript : Capacitor.Plugins.LibreVault
///   isAvailable() · read({name}) -> {data} · write({name,data}) · remove({name}) · move({from,to})
@objc(LibreVaultPlugin)
public class LibreVaultPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "LibreVaultPlugin"
    public let jsName = "LibreVault"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "isAvailable", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "read", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "write", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "remove", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "move", returnType: CAPPluginReturnPromise)
    ]

    private let service = "ch.libre.app.vault"
    private let account = "key-v1"
    private let queue = DispatchQueue(label: "ch.libre.vault")

    private func dir() throws -> URL {
        let base = try FileManager.default.url(for: .applicationSupportDirectory, in: .userDomainMask, appropriateFor: nil, create: true)
        let d = base.appendingPathComponent("LibreVault", isDirectory: true)
        if !FileManager.default.fileExists(atPath: d.path) {
            try FileManager.default.createDirectory(at: d, withIntermediateDirectories: true,
                attributes: [.protectionKey: FileProtectionType.completeUntilFirstUserAuthentication])
        }
        return d
    }

    private func valid(_ n: String?) -> String? {
        guard let n = n, n.range(of: "^[A-Za-z0-9_-]{1,64}$", options: .regularExpression) != nil else { return nil }
        return n
    }

    private func file(_ name: String) throws -> URL { try dir().appendingPathComponent(name + ".bin") }

    private func key() throws -> SymmetricKey {
        let q: [String: Any] = [kSecClass as String: kSecClassGenericPassword, kSecAttrService as String: service,
                                kSecAttrAccount as String: account, kSecReturnData as String: true, kSecMatchLimit as String: kSecMatchLimitOne]
        var out: CFTypeRef?
        let st = SecItemCopyMatching(q as CFDictionary, &out)
        if st == errSecSuccess, let d = out as? Data, d.count == 32 { return SymmetricKey(data: d) }
        guard st == errSecItemNotFound else { throw NSError(domain: "LibreVault", code: Int(st)) }
        let k = SymmetricKey(size: .bits256)
        let raw = k.withUnsafeBytes { Data($0) }
        let add: [String: Any] = [kSecClass as String: kSecClassGenericPassword, kSecAttrService as String: service,
                                  kSecAttrAccount as String: account, kSecValueData as String: raw,
                                  kSecAttrAccessible as String: kSecAttrAccessibleAfterFirstUnlock]
        let s2 = SecItemAdd(add as CFDictionary, nil)
        guard s2 == errSecSuccess else { throw NSError(domain: "LibreVault", code: Int(s2)) }
        return k
    }

    static func seal(_ k: SymmetricKey, _ plain: Data) throws -> Data {
        let box = try AES.GCM.seal(plain, using: k)
        guard let c = box.combined else { throw NSError(domain: "LibreVault", code: -1) }
        return Data([1]) + c
    }

    static func open(_ k: SymmetricKey, _ blob: Data) throws -> Data {
        guard blob.count > 1 + 12 + 16, blob.first == 1 else { throw NSError(domain: "LibreVault", code: -2) }
        return try AES.GCM.open(AES.GCM.SealedBox(combined: blob.dropFirst()), using: k)
    }

    @objc func isAvailable(_ call: CAPPluginCall) {
        queue.async { do { _ = try self.key(); call.resolve(["available": true]) } catch { call.resolve(["available": false]) } }
    }

    @objc func read(_ call: CAPPluginCall) {
        guard let name = valid(call.getString("name")) else { call.reject("Nom invalide", "BAD_NAME"); return }
        queue.async {
            do {
                let f = try self.file(name)
                guard FileManager.default.fileExists(atPath: f.path) else { call.resolve(["data": NSNull()]); return }
                let plain = try LibreVaultPlugin.open(try self.key(), try Data(contentsOf: f))
                call.resolve(["data": String(decoding: plain, as: UTF8.self)])
            } catch {
                // Clé absente (sauvegarde non chiffrée restaurée) ou fichier altéré : rien n’est effacé.
                call.reject("Lecture impossible", "UNREADABLE", error)
            }
        }
    }

    @objc func write(_ call: CAPPluginCall) {
        guard let name = valid(call.getString("name")), let data = call.getString("data") else { call.reject("Paramètres invalides", "BAD_ARGS"); return }
        queue.async {
            do {
                let blob = try LibreVaultPlugin.seal(try self.key(), Data(data.utf8))
                try blob.write(to: try self.file(name), options: [.atomic, .completeFileProtectionUntilFirstUserAuthentication])
                call.resolve()
            } catch { call.reject("Écriture impossible", "WRITE_FAILED", error) }
        }
    }

    @objc func remove(_ call: CAPPluginCall) {
        guard let name = valid(call.getString("name")) else { call.reject("Nom invalide", "BAD_NAME"); return }
        queue.async {
            if let f = try? self.file(name) { try? FileManager.default.removeItem(at: f) }
            call.resolve()
        }
    }

    @objc func move(_ call: CAPPluginCall) {
        guard let from = valid(call.getString("from")), let to = valid(call.getString("to")) else { call.reject("Nom invalide", "BAD_NAME"); return }
        queue.async {
            do {
                let a = try self.file(from), b = try self.file(to)
                if FileManager.default.fileExists(atPath: a.path) { try FileManager.default.moveItem(at: a, to: b) }
                call.resolve()
            } catch { call.reject("Déplacement impossible", "MOVE_FAILED", error) }
        }
    }
}
