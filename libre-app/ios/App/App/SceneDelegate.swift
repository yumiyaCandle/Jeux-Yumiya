import UIKit
import Capacitor

class SceneDelegate: UIResponder, UIWindowSceneDelegate {
    var window: UIWindow?

    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
        guard let windowScene = scene as? UIWindowScene else { return }

        window = UIWindow(windowScene: windowScene)
        window?.rootViewController = MainViewController()
        window?.makeKeyAndVisible()

        SceneDelegateProxy.shared.scene(scene, willConnectTo: session, options: connectionOptions)
    }

    func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
        SceneDelegateProxy.shared.scene(scene, openURLContexts: URLContexts)
    }

    func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
        SceneDelegateProxy.shared.scene(scene, continue: userActivity)
    }

    // MARK: Confidentialité dans le sélecteur d'applications
    // iOS photographie l'écran quand l'app passe en arrière-plan et montre cette image dans le sélecteur d'applications.
    // Dès que la scène n'est plus active, on pose un écran neutre (couleur de lancement + nom de l'app) par-dessus
    // l'interface ; on le retire quand la scène redevient active. Aucun contenu personnel n'apparaît dans l'aperçu.
    // Les captures d'écran faites par l'utilisateur pendant qu'il utilise LIBRE restent possibles.
    private var privacyCover: UIView?

    func sceneWillResignActive(_ scene: UIScene) { showPrivacyCover() }
    func sceneDidEnterBackground(_ scene: UIScene) { showPrivacyCover() }
    func sceneDidBecomeActive(_ scene: UIScene) { hidePrivacyCover() }

    private func showPrivacyCover() {
        guard let window = window, privacyCover == nil else { return }
        let cover = UIView(frame: window.bounds)
        cover.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        cover.backgroundColor = UIColor(red: 14 / 255, green: 39 / 255, blue: 71 / 255, alpha: 1) // #0E2747, comme l'écran de lancement
        let label = UILabel()
        label.text = "LIBRE"
        label.textColor = .white
        label.font = UIFont.systemFont(ofSize: 28, weight: .bold)
        label.translatesAutoresizingMaskIntoConstraints = false
        cover.addSubview(label)
        NSLayoutConstraint.activate([label.centerXAnchor.constraint(equalTo: cover.centerXAnchor),
                                     label.centerYAnchor.constraint(equalTo: cover.centerYAnchor)])
        cover.isAccessibilityElement = false
        window.addSubview(cover)
        privacyCover = cover
    }

    private func hidePrivacyCover() {
        privacyCover?.removeFromSuperview()
        privacyCover = nil
    }
}
