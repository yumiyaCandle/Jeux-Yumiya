# Revue de confidentialité (code, dépendances, manifestes)

22 novembre 2026. Audit interne, pas une certification.

## 1. Manifeste de confidentialité iOS (`libre-app/ios/App/App/PrivacyInfo.xcprivacy`)

| Déclaration | Vérification | Résultat |
|---|---|---|
| `NSPrivacyTracking` = false, aucun domaine de suivi | Aucun SDK de suivi, de publicité ou de mesure d'audience dans `package.json`, `libre-app/package.json`, le projet Xcode et les dépendances Android | Exact |
| `NSPrivacyCollectedDataTypes` vide | Aucune donnée n'est envoyée à l'éditeur ni à un tiers (voir § 3) ; au sens d'Apple, des données traitées seulement sur l'appareil ne sont pas « collectées » | Exact |
| `NSPrivacyAccessedAPITypes` | **Était vide : erreur.** `@capacitor/filesystem` (fichiers d'export et de partage) lit les dates des fichiers, une API qui exige une justification, et ce plugin n'a pas de manifeste | **Corrigé** : `NSPrivacyAccessedAPICategoryFileTimestamp`, raison `C617.1` (documentation Capacitor : capacitorjs.com/docs/ios/privacy-manifest) |

Manifestes des dépendances : Capacitor et CapacitorCordova ont chacun un manifeste vide (aucune API, aucune collecte). Les plugins
`app`, `filesystem`, `haptics`, `local-notifications` et `share` n'en ont pas. Recherche des autres API à justification dans leur code iOS
(UserDefaults, espace disque, horloge système, claviers actifs) : aucune trouvée. **Contrôle final à faire dans Xcode** :
Product › Archive › clic droit sur l'archive › « Generate Privacy Report ».

## 2. Déclarations App Store Connect (App Privacy) et Google Play (Sécurité des données)

« Données non collectées » / « Aucune donnée collectée ni partagée » sont cohérentes avec le code, **à condition** que l'éditeur n'ajoute
ni serveur, ni analytics, ni rapport de plantage. Santé Apple : les données lues restent sur l'appareil (résumés journaliers dans le coffre
chiffré), jamais transmises.

## 3. Communications réseau

- Code de LIBRE : aucune requête automatique (test « aucune requête externe » au démarrage et pendant la navigation).
- Seules sorties : liens ouverts par l'utilisateur (sources, ressources d'aide), appels `tel:`, messages `sms:`, feuille de partage du système.
- Android, dépendances de production : AndroidX, Capacitor, Cordova, `io.ionic.libs:ionfilesystem-android`. Aucun Google Play Services,
  Firebase, SDK publicitaire ou de mesure.
- iOS : Capacitor et plugins officiels seulement ; aucune URL de service dans leur code source.
- Journaux : `loggingBehavior: "none"` ; aucun `console.log` dans l'app.

## 3 bis. Version finale : la promesse « aucune connexion » est maintenant imposée par le navigateur

Une politique de sécurité du contenu (`connect-src 'self'`, images et polices limitées à l’app) empêche la page d’envoyer quoi que ce soit
vers un serveur extérieur, même par erreur ou en cas d’injection de script. Restent possibles, uniquement à l’initiative de l’utilisateur :
ouvrir un lien (navigateur externe), appeler un numéro (`tel:`), partager un fichier (feuille de partage du système).
Les lignes d’aide « jeux d’argent » ajoutées ne changent rien aux données : ce sont des numéros affichés, aucun appel n’est fait par l’app.

## 4. Aperçu dans le sélecteur d'applications (nouveau)

| Plateforme | Avant | Maintenant | Vérifié |
|---|---|---|---|
| iOS | L'aperçu pouvait montrer le journal, les consommations, l'humeur | Écran neutre (couleur de lancement + « LIBRE ») posé dès que la scène n'est plus active, retiré au retour (`SceneDelegate.swift`) | **Non compilé, non essayé** (pas de Mac) |
| Android 13+ | Idem | `setRecentsScreenshotEnabled(false)` : aucun aperçu ; captures d'écran de l'utilisateur toujours possibles | Compilé ; **non essayé** sur appareil |
| Android 7 à 12 | Idem | `FLAG_SECURE` posé seulement en arrière-plan (`onPause`), retiré au retour | Compilé ; **non essayé** ; sur certaines versions l'aperçu peut être pris avant `onPause` |
| Web / PWA | Idem | Contenu masqué dès que la page n'est plus visible (`visibilitychange`, `pagehide`) | Testé (Chromium) ; l'aperçu des onglets de Safari reste à vérifier |

`FLAG_SECURE` permanent n'a pas été retenu : il interdirait aussi les captures d'écran volontaires (utiles pour garder une trace ou
demander de l'aide) et l'enregistrement d'écran pour l'assistance, sans protéger davantage l'aperçu sur Android 13+.

## 5. Exports, partage, presse-papiers

| Sortie | Contenu | Protection | Tests |
|---|---|---|---|
| Sauvegarde | Toutes les données | Chiffrée par défaut ; sans mot de passe après confirmation explicite | Chiffrement, fichier modifié, version future, fichier hostile |
| Copier en texte | Toutes les données en clair | Avertissement « ce texte n'est pas chiffré » ; le texte est affiché, l'utilisateur le copie lui-même | — |
| Bilan mensuel (HTML) | Chiffres du mois, noms d'habitudes, nombre d'entrées de journal (jamais leur texte) | Tout est échappé ; aucun script | Habitude et journal contenant du HTML et du JavaScript : rien ne s'exécute |
| Noms de fichiers | `libre-sauvegarde-AAAA-MM-JJ(.libre).json`, `libre-bilan-AAAA-MM.html` | Aucune donnée personnelle | Test du nom du bilan |
| Fichiers temporaires (apps) | Copie dans le cache de l'app pour la feuille de partage | Supprimée 2 minutes après le partage | Non vérifié sur appareil |

Un fichier partagé (e-mail, cloud, messagerie) sort du contrôle de LIBRE : l'app le dit avant un export sans mot de passe.
