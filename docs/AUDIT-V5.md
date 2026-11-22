# Audit V5 : profondeur, sécurité avancée, préparation à la publication

22 novembre 2026. Base : `livraison/LIBRE-projet-complet.zip` (V4, commit `3f312ab`), l'archive mentionnée dans la demande n'ayant pas été jointe.
Environnement : Linux, sans Mac, sans téléphone, sans émulateur, accès web limité à un moteur de recherche (les sites eux-mêmes sont bloqués).

## 1. Nouveaux problèmes trouvés

| # | Problème | Gravité | État |
|---|---|---|---|
| 1 | **« Effacer toutes mes données » laissait les rappels programmés** dans le téléphone (idem « code oublié », « mot de passe oublié ») : une notification pouvait encore arriver après l'effacement, et trahir l'usage de l'app | **Importante** | Corrigé, testé (plugin simulé) |
| 2 | **Aperçu dans le sélecteur d'applications** : le journal, les consommations ou l'humeur restaient visibles en vignette | **Importante** | Corrigé : iOS (écran neutre, non compilé), Android (compilé), web (testé) |
| 3 | **Manifeste de confidentialité iOS incomplet** : `@capacitor/filesystem` lit les dates des fichiers (API à justifier) ; le manifeste n'en disait rien, ce qui peut bloquer la soumission | **Importante** | Corrigé (`FileTimestamp`, `C617.1`) ; à confirmer par le rapport de confidentialité de Xcode |
| 4 | **Santé Apple : resynchronisation sur 2 jours** seulement : les données d'une montre synchronisée en retard étaient perdues | Moyenne | Corrigé (7 jours), testé (simulé) |
| 5 | **Santé Apple : « Connecté » affiché même si l'accès est refusé** (iOS ne le dit pas aux apps) | Moyenne | Corrigé : « Autorisation demandée, aucune donnée reçue » / « Données reçues », échecs signalés ; testé (simulé) |
| 6 | **Santé Apple : fuseau horaire figé** au lancement (voyage : jours décalés) | Moyenne | Corrigé dans le code Swift, **non compilé** |
| 7 | **Nouvelle installation : aucun moyen de restaurer une sauvegarde** depuis l'accueil (il fallait d'abord créer un faux profil) | Moyenne (risque de perte lors d'un changement de téléphone) | Corrigé : bouton « Restaurer une sauvegarde », testé de bout en bout |
| 8 | Critère « confirmé » des numéros d'aide trop large (annuaires, médias acceptés) | Moyenne | Corrigé : niveaux de source ; 3 numéros belges rétrogradés |
| 9 | Documentation : « `ch.libre.app` suppose que tu contrôles libre.ch » | Faible (inexact) | Corrigé |
| 10 | Documentation : AAB annoncé mais absent du ZIP du projet | Faible | Corrigé : livré à part, avec son empreinte |
| 11 | **Nom « LIBRE »** : utilisé par Abbott (FreeStyle Libre, app « Libre ») en santé numérique | **Importante** (juridique, hors code) | Signalé ; **non résolu** (`ACTIONS-RESTANTES.md` § 2 ter) |
| 12 | Aucune intégration continue | Moyenne | Ajoutée (`.github/workflows/verification.yml`), **jamais exécutée** |

Vérifiés sans défaut : noms de fichiers exportés (dates seulement), échappement du bilan mensuel (HTML et JavaScript hostiles), aucune
dépendance réseau ou de suivi (Android : AndroidX, Capacitor, Cordova, ionfilesystem), `npm audit` 0 vulnérabilité (V4), chiffrement
web et natif inchangé (aucune migration nécessaire).

## 2. Ce qui a été réellement exécuté ici

| Vérification | Résultat |
|---|---|
| `npm test` (langues, LIBRE.html à jour, 64 tests Playwright dont 6 nouveaux) | **64 réussis, 0 échoué** (`tests/RESULTATS.md`) |
| Tests unitaires Android (`testDebugUnitTest`) | **12 réussis** : 11 de chiffrement (dont 5 nouveaux scénarios d'attaque : chaque bit modifié, toutes les troncatures, collage d'IV, 2 000 IV uniques, 8 Mo) + 1 exemple |
| `assembleDebug`, `assembleRelease`, `bundleRelease` | Réussis ; AAB **non signé** |
| `lintRelease` | 0 erreur, 29 avertissements (inchangés depuis la V4) |
| `cap sync` | Copies iOS et Android identiques à `libre/index.html` |
| Archive `LIBRE-V5-COMPLET.zip` | Extraite et vérifiée (voir rapport de livraison) |

Simulé seulement : tout ce qui touche aux plugins natifs dans les tests Playwright (coffre, rappels, Santé, partage, fichiers).
Jamais exécuté : le code Swift (iOS), l'app sur un téléphone, l'intégration continue, les 82 liens des sources, les appels aux numéros d'aide.

## 3. Réponses aux questions

1. **Nouveaux problèmes** : les 12 du tableau.
2. **Réellement importants** : rappels non annulés (1), aperçu du sélecteur (2), manifeste incomplet (3), marque (11).
3. **Corrigés** : 1 à 10 et 12 (avec les réserves « non compilé » pour iOS).
4. **Action de ta part** : marque (11), compilation et essais iOS, essais Android sur appareil, signature, validation médicale,
   numéros d'aide, informations légales, adresse publique de la politique, activation de l'intégration continue (`ACTIONS-RESTANTES.md`).
5. **Confidentialité suffisante pour une bêta publique ?** Côté code, **oui pour une bêta**, sous réserve des essais du sélecteur
   d'applications sur appareil. Côté éditeur, **non** tant que la politique n'a ni éditeur, ni contact, ni adresse publique.
6. **Chiffrement correct ?** Android : conception correcte (AES-256-GCM, Keystore, IV aléatoire, authentification), testée sur JVM, pas sur
   téléphone. iOS : conception correcte (CryptoKit, trousseau), **jamais compilée**. Web : correct (Web Crypto, PBKDF2 600 000), testé ;
   par nature, une page web ne protège pas contre un logiciel malveillant installé sur l'appareil. Aucun audit externe.
7. **La politique reflète-t-elle le code ?** Oui sur les points vérifiés (aucune collecte, aucun réseau, stockage local, Santé en lecture
   seule, ce qui ne peut pas être effacé : `DATA-LIFECYCLE.md`). Les champs de l'éditeur restent à remplir.
8. **HealthKit prêt ?** **Non.** Logique revue et corrigée, mais jamais compilée ni comparée à de vraies données (`HEALTHKIT-REVIEW.md`).
9. **Android prêt pour une bêta fermée ?** **Presque** : compile, tests passent ; manquent la signature, un essai sur 2 téléphones et la
   fiche Play (politique, éditeur).
10. **iOS prêt pour TestFlight ?** **Non** : jamais compilé ; il faut un Mac, une équipe Apple et un premier essai.
11. **Tests réellement exécutés** : section 2.
12. **Simulés** : plugins natifs dans Playwright ; voir `TESTS.md` (colonne « Simulé »).
13. **Validations médicales obligatoires** : « Quand consulter », avertissements de sevrage, parcours SOS, numéros d'aide ; puis frises,
    bibliothèque, exercices (`VALIDATION-MEDICALE.md`, tableau de synthèse V5).
14. **Ce qui empêche une publication officielle** : risque de marque ; validation médicale ; éditeur et politique publiée ; iOS non compilé ;
    aucun essai sur appareil ; numéros d'aide non contrôlés pour tous les pays de distribution ; traductions longues non relues.

## 4. Niveau de préparation

| Version | Niveau | Pourquoi |
|---|---|---|
| Web / PWA | **7 / 10** | Testée automatiquement de bout en bout ; manquent la validation médicale, l'éditeur et l'essai Safari iOS |
| Android | **5,5 / 10** | Compile et passe ses tests ; jamais lancé sur un téléphone ; non signé |
| iOS | **3 / 10** | Code complet mais jamais compilé ; HealthKit et écran neutre non vérifiés |
| Publication officielle | **2,5 / 10** | Bloquée par la marque, la validation médicale, les informations légales et les essais sur appareil |

## 5. Expérience utilisateur (revue ciblée)

- **Premier lancement** : ajout de « Restaurer une sauvegarde » (cas du changement de téléphone). Le reste du parcours (choix de
  l'habitude, date, objectif) est inchangé ; il fonctionne en 3 écrans (test « Créer un profil de bout en bout »).
- **Usage quotidien** : rien à retirer ; l'accueil met en avant l'action du jour et le SOS.
- **Moments difficiles** : après un écart, le total des jours sans reste mis en avant (testé) ; SOS accessible partout ; numéros d'aide
  du pays choisi uniquement. Aucun ajout : je préfère ne pas complexifier ces écrans sans avis professionnel.

## 6. Documents V5

`APPLE-ENCRYPTION-COMPLIANCE.md`, `PRIVACY-REVIEW.md`, `HEALTHKIT-REVIEW.md`, `DATA-LIFECYCLE.md`, `RELEASE-PROCESS.md`,
`ACTIONS-RESTANTES.md` (mis à jour), `RESSOURCES-AIDE.md` (niveaux de source), `TESTS-APPAREILS.md` (ajouts V5), `VALIDATION-MEDICALE.md` (synthèse).
