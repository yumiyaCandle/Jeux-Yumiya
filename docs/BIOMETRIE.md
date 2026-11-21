# Déverrouillage biométrique (Face ID, Touch ID, empreinte)

**État : code écrit, option cachée.** Il n'apparaît dans l'app qu'après un essai réussi sur de vrais téléphones.

## Ce qui existe

| Partie | Fichier | État |
|---|---|---|
| Android : `biometricStatus`, `biometricAuth` (AndroidX `BiometricPrompt`, biométrie forte ou faible) | `libre-app/android/app/src/main/java/ch/libre/app/LibreVaultPlugin.java`, dépendance `androidx.biometric:biometric:1.1.0` dans `app/build.gradle` | **Compilé** (`assembleDebug` réussi), **jamais essayé sur un téléphone** |
| iOS : mêmes méthodes (`LAContext`, `deviceOwnerAuthenticationWithBiometrics`) | `libre-app/ios/App/App/LibreVaultPlugin.swift`, `NSFaceIDUsageDescription` dans `Info.plist` et `*.lproj/InfoPlist.strings` | **Ni compilé ni essayé** (Xcode nécessaire) |
| App : réglage « Déverrouiller avec Face ID / Touch ID / l'empreinte », bouton sur l'écran verrouillé, proposition automatique à l'ouverture | `libre/index.html` (`BIO_ENABLED`, `bioRow`, `bioSet`, `bioUnlock`) | Testé avec un plugin simulé (test « Biométrie ») |

## Règles de conception

- Proposé seulement dans l'app iPhone et Android, et seulement si un code de verrouillage existe.
- La biométrie **lève seulement le verrouillage** (qui masque l'app). Elle ne remplace pas le code (toujours accepté),
  ne touche pas au chiffrement du coffre et ne change rien aux sauvegardes.
- Un échec ou une annulation laisse l'écran verrouillé avec le champ du code ; les erreurs biométriques ne comptent pas
  dans les délais après erreurs de code.
- LIBRE ne reçoit jamais le visage ni l'empreinte : c'est le système qui répond « oui » ou « non ».

## Pour l'activer

1. Compiler l'app iOS dans Xcode 26 (corriger d'éventuelles erreurs de compilation Swift dans les deux méthodes).
2. Sur un iPhone avec Face ID, un iPhone ou iPad avec Touch ID, un Android avec empreinte, puis un Android sans biométrie :
   - Profil › activer un code, puis « Déverrouiller avec … » : la feuille du système s'affiche ; accepter.
   - Mettre l'app en arrière-plan plus d'une minute, revenir : la biométrie est proposée ; réussir, puis annuler, puis échouer.
   - Vérifier qu'après une annulation le code fonctionne toujours.
   - Sur un téléphone sans biométrie : message « Indisponible sur ce téléphone ».
   - Retirer la biométrie dans les réglages du téléphone : l'app doit revenir au code sans blocage.
3. Si tout est correct : dans `libre/index.html`, passer `const BIO_ENABLED=false` à `true`, lancer `npm test`, puis
   `cd libre-app && npm run sync`.
4. App Store Connect : rien à déclarer en plus (aucune donnée biométrique n'est collectée).
