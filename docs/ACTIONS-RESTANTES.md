# Ce qui reste à faire avant la publication

Tout ce qui suit demande ton intervention : une information que je n'ai pas, un compte à ton nom, un appareil réel ou un avis professionnel.
Les détails des stores sont dans `PUBLICATION.md`.

## 1. Informations légales (à fournir, ne pas inventer)

| Quoi | Où le mettre |
|---|---|
| Nom de l'éditeur (personne ou société) | `libre/privacy.html` : `[NOM OU SOCIÉTÉ À COMPLÉTER]` et `[NAME OR COMPANY – TO BE COMPLETED]` |
| Adresse postale | `libre/privacy.html` : `[ADRESSE À COMPLÉTER]` / `[ADDRESS – TO BE COMPLETED]` |
| Adresse e-mail de contact et de support | `libre/privacy.html` et pied de page de `libre/site/index.html` |
| Adresse publique de la politique de confidentialité | Activer GitHub Pages ou un autre hébergement ; si l'adresse change, modifier `PRIVACY_URL` dans `libre/index.html` |
| Vérification juridique (Suisse : nLPD ; UE : RGPD) | La politique décrit fidèlement le fonctionnement, mais ce n'est pas un avis juridique. Faire relire par un juriste si possible. Des conditions d'utilisation ne sont pas obligatoires pour une app gratuite sans compte ; un juriste peut te conseiller d'en ajouter |

## 2. Comptes et signature

- Compte **Apple Developer** (99 USD/an) et compte **Google Play Console** (25 USD, une fois).
- **Identifiant de l'app** : `ch.libre.app` suppose que tu contrôles le domaine libre.ch. Sinon, choisis le tien (définitif après publication).
- **Clé de signature Android** (clé d'upload) : à créer et garder hors du dépôt.
- iOS : équipe de signature dans Xcode, capacité HealthKit.

## 3. Essais sur de vrais appareils (impossibles ici)

Suivre `TESTS-APPAREILS.md`. En priorité :
- **Compilation iOS** sur un Mac avec Xcode 26, puis essais sur iPhone : coffre chiffré, Santé Apple, rappels app fermée, partage de fichiers.
- **Android réel** (un récent, un ancien) : rappels après redémarrage du téléphone, refus de la permission de notifications, bouton Retour.
- **Lecteurs d'écran** : VoiceOver (iPhone) et TalkBack (Android) sur Accueil, SOS, ajout d'une consommation, graphiques.
- **Grande taille de texte** du système (200 %).
- Version web chiffrée : rechargement après 5 minutes en arrière-plan sur Safari iPhone et Chrome Android.

## 4. Relecture médicale

Par un professionnel de santé qualifié (addictologue de préférence) : fiches par addiction, page « Quand consulter », frise « Mon corps »,
avertissements alcool / benzodiazépines / opioïdes, numéros d'aide de chaque pays où l'app sera distribuée. Garder une trace écrite
(nom, date, version relue).

## 5. Traductions

Les 14 langues partielles (ar, da, hi, id, ja, ko, nb, nl, pl, ru, sv, tr, vi, zh) ont environ 826 textes chacune en anglais.
Deux options honnêtes : faire traduire et relire ces textes par des personnes de langue maternelle, ou ne proposer au lancement que
les 6 langues complètes (fr, en, de, it, es, pt). Les contenus longs (bibliothèque, frise « Mon corps ») ne sont qu'en fr et en.

## 6. Développements proposés, non faits

| Développement | Pourquoi pas maintenant | Ce qu'il faut |
|---|---|---|
| Verrouillage biométrique (Face ID, empreinte) | Module natif impossible à essayer ici | Ajouter au plugin LibreVault une méthode `authenticate` : iOS `LAContext.evaluatePolicy(.deviceOwnerAuthentication)` + clé `NSFaceIDUsageDescription` dans Info.plist ; Android `androidx.biometric.BiometricPrompt` (dépendance `androidx.biometric:biometric`). Côté app : option dans Profil, en plus du code (jamais à la place d'une sauvegarde) |
| Traduction complète des 14 langues | Volume et qualité (voir § 5) | Traducteurs |
| Découpage de `index.html` en modules | Gain faible, risque de régression | Un outil de build (par exemple Vite) et la suite de tests comme filet |
| Health Connect (Android) | Aucune fonction n'en a besoin | À décider si une fonction l'exige un jour |

## 7. Avant chaque envoi aux stores

- Incrémenter la version : `VERSION` dans `libre/sw.js`, version et build iOS, `versionCode` Android.
- Lancer `node tests/run.js` (tous les tests doivent réussir), puis `python3 tools/build-standalone.py`,
  puis dans `libre-app/` : `npm run web && npx cap sync`.
- Régénérer les captures si l'interface a changé : `node libre-app/store/make-screenshots.js`.
