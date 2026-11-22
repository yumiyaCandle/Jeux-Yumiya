# Tests finaux de LIBRE

22 novembre 2026. Environnement : Linux, Node 22, Playwright 1.63.0 + Chromium, JDK 21, SDK Android ; **pas de Mac, pas de téléphone,
pas d'émulateur**. Détail test par test : `TESTS.md` (généré) et `tests/RESULTATS.md` (écrit par le lanceur lui-même).

## 1. Classement

| Statut | Nombre | Contenu |
|---|---|---|
| **Réussi réellement** | 56 tests web + 12 tests JUnit + 3 contrôles + 3 compilations | Comportement de l'app dans Chromium (web, PWA, `LIBRE.html`), format chiffré du coffre Android sur la JVM, contrastes, zones tactiles, versions ; `assembleDebug`, `assembleRelease`, `bundleRelease` ; lint (0 erreur) ; `npm audit` (0 vulnérabilité) |
| **Simulé** | 11 tests web | Logique de LIBRE avec des plugins natifs **factices** (coffre, rappels, Santé Apple, partage, fichiers). Prouve que LIBRE appelle correctement les plugins ; **ne prouve pas** que les plugins natifs fonctionnent sur un téléphone |
| **Échoué** | 0 | — |
| **Non exécuté** | — | Compilation iOS ; toute exécution sur iPhone ou Android ; intégration continue GitHub (workflow jamais lancé) ; vérification des 82 liens de sources (réseau bloqué) ; appels réels aux numéros d'aide ; VoiceOver et TalkBack réels |

## 2. Commandes exécutées (et résultat réel)

| Commande | Résultat |
|---|---|
| `npm test` (langues, `LIBRE.html` à jour, 67 tests Playwright) | 67 réussis, 0 échoué |
| `npm run check:contrast` | Aucun texte mesurable sous le seuil AA (clair et sombre) |
| `npm run check:targets` | Toutes les cibles ≥ 24 × 24 px |
| `npm run check:versions` | 1.0.0 / build 1 sur Android, iOS, `package.json` ; copies natives et `LIBRE.html` à jour |
| `npm audit --audit-level=high` (racine et `libre-app`) | 0 vulnérabilité |
| `./gradlew assembleDebug assembleRelease bundleRelease :app:testDebugUnitTest lintRelease` | Réussi ; 12 tests JUnit ; lint : 0 erreur, 29 avertissements |
| Extraction de `LIBRE-FINAL-COMPLET.zip` dans un dossier vierge, puis `npm ci`, `npm test`, `npm run sync`, `gradlew assembleDebug bundleRelease :app:testDebugUnitTest` | Réussi : archive intègre, aucun fichier de clé ou de secret, 67 tests réussis, contrastes et cibles conformes, versions cohérentes, compilation Android et 12 tests JUnit réussis |

## 3. Tests ajoutés dans cette version (non-régression)

| Test | Protège contre |
|---|---|
| Sécurité · Politique de sécurité (CSP) | Une régression qui réintroduirait une connexion externe ou casserait l'app sous CSP |
| Aide · Jeux d'argent | Ligne spécialisée absente, ou affichée à tort à tout le monde |
| Sécurité santé · Avertissement de sevrage | Disparition de l'avertissement « le sevrage peut être dangereux » pour l'alcool |
| Contrôles `check:contrast`, `check:targets`, `check:versions` | Régression de contraste, de taille de cible, ou versions désynchronisées |

## 4. À faire sur appareils réels

`TESTS-APPAREILS.md` : plan complet (iPhone Face ID et Touch ID, Android récent et ancien), dont les ajouts de cette version :
CSP dans les WebView, rangée d'urgence du SOS (appel direct), feuilles modales opaques, zones tactiles des liens.
