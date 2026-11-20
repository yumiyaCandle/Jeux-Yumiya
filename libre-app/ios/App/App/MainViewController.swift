import UIKit
import Capacitor

/// Contrôleur principal de LIBRE : enregistre les deux plugins locaux de l’app.
/// - LibreVault  : coffre de données chiffré (toujours)
/// - LibreHealth : lecture facultative de Santé Apple (HealthKit)
/// Il est créé par SceneDelegate.swift.
class MainViewController: CAPBridgeViewController {
    override open func capacitorDidLoad() {
        bridge?.registerPluginInstance(LibreVaultPlugin())
        bridge?.registerPluginInstance(LibreHealthPlugin())
    }
}
