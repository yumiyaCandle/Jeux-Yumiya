# Ce que tu dois fournir ou faire toi-même

Mis à jour le 22 novembre 2026 (version 5). Je n'invente aucune de ces informations.

## 1. Informations légales

| À fournir | Où le mettre |
|---|---|
| Nom de l'éditeur (personne ou société) | `libre/privacy.html` : `[NOM OU SOCIÉTÉ À COMPLÉTER]` / `[NAME OR COMPANY – TO BE COMPLETED]` ; fiches des stores |
| Adresse postale | `libre/privacy.html` : `[ADRESSE À COMPLÉTER]` / `[ADDRESS – TO BE COMPLETED]` ; Google Play si l'app devient payante |
| E-mail de contact (questions sur la confidentialité) | `libre/privacy.html` : `[ADRESSE E-MAIL À COMPLÉTER]` / `[E-MAIL ADDRESS – TO BE COMPLETED]` |
| E-mail de support | `libre/site/index.html` (pied de page, fr et en) ; fiches des stores |
| Numéro d'entreprise (si société) | Fiches des stores, selon le pays |
| Adresse publique de la politique de confidentialité et de la page de présentation | **Bloquant.** `PRIVACY_URL` vaut `https://yumiyacandle.github.io/Jeux-Yumiya/libre/privacy.html`. Je n'ai pas pu l'ouvrir (domaine bloqué dans mon environnement) et la branche par défaut `main` du dépôt **ne contient pas** le dossier `libre/` : cette adresse ne fonctionnera que si GitHub Pages publie la branche qui contient LIBRE (ou après fusion dans `main`). Confirme que le compte GitHub `yumiyacandle` est bien à toi (ou à l'éditeur), active Pages, ouvre l'adresse dans un navigateur, puis donne-la aux stores. Si tu choisis un autre hébergement, change `PRIVACY_URL` dans `libre/index.html` |
| Validation juridique (nLPD suisse, RGPD si diffusion dans l'UE) | Faire relire `libre/privacy.html` par un juriste. Je n'ai fourni aucun avis juridique |

## 2. Comptes, identifiants, signatures

- Compte **Apple Developer** (99 USD/an) et compte **Google Play Console** (25 USD, une fois).
- **Identifiant de l'app** : `ch.libre.app`, identique sur iOS et Android. Apple et Google n'exigent **pas** de posséder le domaine
  `libre.ch` : l'identifiant doit seulement être unique et, sur Google Play, il ne peut plus changer après la première publication.
  La notation « domaine inversé » est une convention ; un identifiant fondé sur un domaine qui t'appartient évite toute confusion et
  tout conflit futur. Si `ch.libre.app` est déjà pris sur l'un des stores, l'enregistrement de l'app échouera : choisis alors un identifiant
  à toi (ex. `ch.tonnom.libre`) **avant** la première publication. Je ne l'ai pas changé.
- **Signature Android** : créer la clé d'upload, la garder hors du dépôt, activer Play App Signing.
- **Signature iOS** : équipe dans Xcode, capacité HealthKit.

## 2 bis. Signature et fichiers Android

- `LIBRE-android-release-NON-SIGNE.aab` est **livré à part** (il n'est pas dans `LIBRE-V5-COMPLET.zip`, qui ne contient que le projet).
  Empreinte SHA-256 : `f2ba0a4f8987634e692202904d42039a4f83827be84f90ace279014eb127981d`. Il est construit mais **non signé** : signe-le avec ta clé d'upload
  (Android Studio › Build › Generate Signed Bundle) avant de l'envoyer sur Google Play. Tu peux aussi le reconstruire toi-même
  (`RELEASE-PROCESS.md`).
- `LIBRE-android-debug.apk` (livré à part) : pour essayer sur un téléphone Android, jamais pour le store.

## 2 ter. Nom et marque « LIBRE » (risque important)

« Libre » est utilisé par **Abbott** pour ses capteurs de glycémie FreeStyle Libre et l'app « Libre » sur les stores, dans le domaine de la
santé numérique. Des agrégateurs mentionnent une marque « LIBRE » déposée aux États-Unis en classe 9 (logiciels) ; je ne l'ai pas vérifié dans
les registres officiels. **Je ne peux pas dire si le nom est disponible.** Avant de publier :
1. Recherche de marque dans Swissreg (IPI), EUIPO (eSearch plus), WIPO Global Brand Database et USPTO, classes 9, 10, 42 et 44.
2. Faire valider par un conseil en propriété intellectuelle.
3. Si le risque est confirmé : choisir un nom composé (ex. « LIBRE — … » ne suffit pas forcément) **avant** la première publication,
   car le nom de la fiche, les captures et l'identifiant en dépendent.

## 2 quater. Intégration continue (GitHub Actions)

`.github/workflows/verification.yml` : tests web, compilation Android, compilation iOS à la demande, **sans secret ni publication**.
Il n'a jamais tourné. À faire : Actions › activer les workflows, ouvrir une pull request ou lancer « Run workflow », lire le résultat.
Les macOS de GitHub sont facturés en minutes : le travail iOS est désactivé par défaut.

## 3. Appareils et essais (impossibles dans mon environnement)

- Un **Mac avec Xcode 26** : compiler l'app iOS (le code Swift et le projet n'ont jamais été compilés ici ; nouveauté V5 à vérifier en
  premier : `SceneDelegate.swift`, écran neutre dans le sélecteur d'applications). Ou le travail iOS de l'intégration continue.
- Un **iPhone** (idéalement un avec Face ID et un avec Touch ID) et **deux Android** (un récent, un ancien, dont un avec empreinte).
- Suivre `TESTS-APPAREILS.md` ; puis `BIOMETRIE.md` pour décider d'activer la biométrie.

## 4. Validation médicale

Par un professionnel de santé qualifié (addictologue de préférence) : liste dans `VALIDATION-MEDICALE.md`. Numéros d'aide de chaque
pays de distribution : `RESSOURCES-AIDE.md` (critères V5 plus stricts : 41 confirmés par une source officielle ou institutionnelle, 3 probables sur la seule foi d'annuaires, 65 à vérifier ; Belgique, Portugal et Brésil en priorité). Garder une trace écrite de la relecture.

## 5. Traductions humaines

- Contenus longs (bibliothèque, frise « Mon corps ») en allemand, italien, espagnol, portugais.
- Les 14 langues non proposées : fichiers prêts dans `i18n/a-traduire/` (`LANGUES.md`).

## 6. Vérifications à lancer sur un ordinateur connecté

- `python3 tools/check-sources.py` : les 82 liens cités. **Toujours non vérifiés** : en V5, l'accès direct aux sites est encore bloqué dans mon environnement.
- Relire les exigences des stores au moment de la soumission (`PUBLICATION.md`).

## 7. Décisions qui t'appartiennent

- Activer la biométrie après les essais (`BIOMETRIE.md`).
- Rouvrir des langues après traduction (`LANGUES.md`).
- Garder ou non le support iPad (captures iPad à fournir si gardé).
- Pays de distribution (les numéros d'aide affichés en dépendent).
