# Vérifier et publier une nouvelle version de LIBRE

## 1. Versions actuelles (22 novembre 2026)

| Élément | Valeur | Où |
|---|---|---|
| Version de l'app | 1.0.0 | `android/app/build.gradle` (`versionName`), Xcode (`MARKETING_VERSION`), `libre-app/package.json` |
| Numéro de build | 1 | `versionCode` (Android), `CURRENT_PROJECT_VERSION` (iOS) |
| Version du service worker | `libre-2026-11-22-v5` | `libre/sw.js` |
| Schéma des données | 2 (`S.v`) | `normalize()` |
| Compatibilité des données | 3 (`APP_DATA_V`) | une version plus ancienne passe en lecture seule |
| Format de sauvegarde | 5 (`BK_FORMAT`) | les formats plus récents sont refusés avec un message |

Aucune version n'ayant été publiée, ces numéros n'ont pas été augmentés.

## 2. Vérifier (à chaque modification)

```
npm ci
npm run test:setup      # une fois : Chromium pour Playwright
npm test                # langues + LIBRE.html à jour + tous les tests (code 1 au premier échec)
cd libre-app && npm ci && npm run sync
cd android && ./gradlew assembleDebug :app:testDebugUnitTest lintRelease assembleRelease bundleRelease
```

Lire les résultats : `tests/RESULTATS.md` (écrit par le lanceur), `libre-app/android/app/build/reports/` (tests unitaires et lint).
Sur GitHub : `.github/workflows/verification.yml` fait la même chose sur chaque pull request ; iOS à la demande (Actions › Vérification LIBRE ›
Run workflow › « Compiler aussi l'app iOS »). **Ce workflow n'a jamais tourné** : à activer et observer une première fois.

## 3. Préparer une version

1. Mettre à jour le contenu, puis `npm test`.
2. Augmenter **ensemble** : `versionName` et `MARKETING_VERSION` (ex. 1.0.1), `versionCode` et `CURRENT_PROJECT_VERSION` (+1 à chaque envoi),
   `VERSION` dans `libre/sw.js`.
3. Si la structure des données change : ajouter une étape à `normalize()` (ne jamais supprimer une donnée valide), augmenter `APP_DATA_V`,
   ajouter un test qui charge l'ancien format. Si le format de sauvegarde change : augmenter `BK_FORMAT` **et** garder la lecture des anciens formats.
4. Ne jamais changer l'algorithme ou la clé du coffre sans migration : lire avec l'ancienne méthode, réécrire, relire, puis seulement supprimer.
5. `python3 tools/build-standalone.py`, puis `cd libre-app && npm run sync`.
6. Android : `bundleRelease`, signer avec la clé d'upload (Android Studio), envoyer en test interne. iOS : Xcode › Archive, TestFlight.
7. Essais sur appareils (`TESTS-APPAREILS.md`), **en installant la nouvelle version par-dessus l'ancienne** (scénario « mise à jour »).
8. Seulement ensuite : publication.

## 4. Ne jamais

Mettre une clé de signature, un mot de passe ou un fichier `.keystore` / `.p12` dans le dépôt ou dans une archive ; publier automatiquement
depuis l'intégration continue.
