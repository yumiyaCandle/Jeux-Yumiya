# LIBRE – applications iPhone et Android

Ce dossier contient les **vrais projets natifs** de LIBRE, construits avec Capacitor 8 autour de l’application web
`../libre/index.html` (le même code sur le web, sur iPhone et sur Android).

```
libre-app/
├── android/                  projet Android Studio (Gradle, Java)
│   └── app/src/main/java/ch/libre/app/
│       ├── MainActivity.java       enregistre le plugin LibreVault
│       └── LibreVaultPlugin.java   coffre chiffré (AES-256-GCM, clé dans l’Android Keystore)
├── ios/App/                  projet Xcode (Swift Package Manager)
│   └── App/
│       ├── MainViewController.swift   enregistre LibreVault et LibreHealth
│       ├── LibreVaultPlugin.swift     coffre chiffré (CryptoKit, clé dans le trousseau)
│       ├── LibreHealthPlugin.swift    lecture facultative de Santé Apple (HealthKit)
│       ├── App.entitlements           droit HealthKit
│       ├── PrivacyInfo.xcprivacy      manifeste de confidentialité Apple
│       └── Info.plist                 textes d’autorisation Santé, chiffrement exempté
├── assets/                   images sources de l’icône et de l’écran de lancement
├── scripts/sync-web.mjs      copie ../libre dans www/
├── scripts/render-assets.js  produit assets/ à partir du logo
└── capacitor.config.json     identifiant ch.libre.app, nom LIBRE
```

## Pourquoi Capacitor

| Option | Pour | Contre | Verdict |
|---|---|---|---|
| **Capacitor 8** | Réutilise tel quel le code testé de LIBRE (une seule source, 6 langues proposées) ; vrais projets Xcode / Android Studio ; plugins natifs écrits en Swift et Java quand il le faut | Interface rendue dans une WebView | **Retenu** : publier sans réécrire, en gardant une seule base de code |
| Réécriture SwiftUI + Kotlin | Interface 100 % native | Deux réécritures complètes, risques de régression, coût ×3 | Disproportionné pour la v1 |
| React Native / Flutter | Une base mobile commune | Réécriture complète de l’interface | Même problème que ci-dessus |
| PWA seule | Aucun store | Pas de HealthKit, rappels seulement app ouverte, pas de présence sur les stores | Insuffisant |

Capacitor 8 est requis : il cible Android 16 (API 36), exigé par Google Play depuis le 31 août 2026, et se compile avec Xcode 26,
exigé par l’App Store depuis le 28 avril 2026.

## Prérequis

- Node.js 22 ou plus récent
- **iOS** : un Mac avec Xcode 26 ou plus récent, un compte Apple Developer (99 USD/an), un iPhone sous iOS 15 ou plus récent
- **Android** : Android Studio (Otter 2025.2 ou plus récent) ou le SDK Android (plateforme 36, build-tools 36) et Java 21

## Construire

```bash
cd libre-app
npm install
npm run sync          # copie ../libre dans www/ puis synchronise iOS et Android
```

### Android

```bash
npm run android:debug         # APK de test : android/app/build/outputs/apk/debug/app-debug.apk
cd android && ./gradlew testDebugUnitTest   # tests unitaires du chiffrement du coffre
```

Pour la publication (fichier .aab signé) :
1. Créer une clé d’upload : `keytool -genkeypair -v -keystore libre-upload.jks -keyalg RSA -keysize 4096 -validity 10000 -alias libre`
   (à garder hors du dépôt, avec ses mots de passe, dans un gestionnaire de mots de passe).
2. Dans Android Studio : Build › Generate Signed App Bundle, ou configurer `signingConfigs` via des variables d’environnement.
3. Activer « Play App Signing » dans la Play Console (Google garde la clé de signature finale).
4. Augmenter `versionCode` (et `versionName`) dans `android/app/build.gradle` à chaque envoi.

### iOS

```bash
npm run ios          # synchronise puis ouvre Xcode
```
Dans Xcode, cible **App** › Signing & Capabilities :
1. Choisir ton équipe (*Team*). Changer l’identifiant `ch.libre.app` si tu ne possèdes pas ce domaine (il doit être unique).
2. Vérifier que la capacité **HealthKit** est présente (sinon : + Capability › HealthKit). Le fichier `App.entitlements` est déjà référencé.
3. Choisir un iPhone branché, puis **Run**.
4. Publication : Product › Archive, puis Distribute App › App Store Connect.
5. Augmenter *Version* (1.0.0) et *Build* (1) à chaque envoi.

Après toute modification de `../libre/index.html` : `npm run sync`.

## Ce que font les plugins natifs

**LibreVault** (iOS et Android, toujours actif). Les données de LIBRE sont enregistrées dans un fichier chiffré
en AES-256-GCM. La clé est créée sur l’appareil, dans le trousseau iOS ou l’Android Keystore. La page web ne voit jamais la clé.
- Au premier lancement après une mise à jour depuis une version qui utilisait le stockage de la WebView, les données sont copiées
  dans le coffre, relues et comparées, puis seulement effacées de l’ancien emplacement.
- Fichier illisible (clé absente) : il est mis de côté (`state-illisible-…`), jamais écrasé, et l’utilisateur est invité à restaurer sa sauvegarde.
- iPhone : la clé suit les sauvegardes iCloud et les sauvegardes **chiffrées** de l’ordinateur. Android : la sauvegarde automatique est désactivée ;
  changer de téléphone se fait par un fichier d’export (chiffré par mot de passe).

**LibreHealth** (iPhone, facultatif). Lecture seule de Santé Apple : pas, minutes d’exercice, distance, énergie active, sommeil,
fréquence cardiaque, fréquence au repos, VFC, fréquence respiratoire. Résumés par jour, enregistrés dans le coffre, jamais transmis.

**Plugins Capacitor officiels** : Local Notifications (rappels), Filesystem et Share (export de sauvegarde et du bilan par la feuille de partage),
App (bouton Retour d’Android).

## Choix de sécurité côté Android

- `allowBackup="false"` et règles d’extraction vides (pas de copie cloud ni de transfert d’appareil).
- Permission `SCHEDULE_EXACT_ALARM` retirée : Google Play la réserve aux réveils et agendas. Les rappels peuvent être décalés de quelques minutes par le système.
- Partage de fichiers limité au dossier cache.
- Débogage de la WebView désactivé (`webContentsDebuggingEnabled: false`).

## Tests

- `../tests/` : 29 tests automatisés de l’app (Playwright), dont les plugins natifs simulés. `node tests/run.js` depuis la racine du dépôt.
- `android/app/src/test/` : tests unitaires du format chiffré.
- Tests sur appareils réels : `../docs/TESTS-APPAREILS.md`.
