# LIBRE « Clairière » : rapport final de la refonte

22 novembre 2026. Base : `a38a2d0` (étiquette `avant-refonte-v2`). Audit initial : `AUDIT-CLAIRIERE.md`.
Comparaisons : `docs/ux/clairiere/*.jpg` (avant à gauche, maintenant à droite) ; tous les écrans : `docs/ux/clairiere/avant/` et `apres/`.
**Tout est implémenté dans le vrai projet et testé automatiquement dans Chromium. Rien n'a été essayé sur un téléphone réel ; l'app iOS
n'a jamais été compilée (pas de Mac).**

## 1. Nouvelle identité : « Clairière »

Une clairière est l'endroit où la forêt s'ouvre et où la lumière arrive. C'est l'image du chemin que LIBRE accompagne : sortir d'un
endroit fermé vers un endroit ouvert, sans brutalité.

| Sensation | Traduction visuelle |
|---|---|
| Confiance | Encre **vert pin** `#12302A` (action principale, textes) : stable, sérieuse, sans froideur médicale |
| Sérénité | Fond **brume** `#F1F3EE`, beaucoup d'air, filets fins, aucune ombre lourde |
| Bienveillance | **Abricot** `#E8915F` (soleil du logo, lumière du bloc principal), titres en **serif** humains |
| Progression | **Sauge** `#2E7B5A` pour ce qui avance (barres, réussites, coches) |
| Liberté | Le **logo** : un arc ouvert (jamais fermé) et un soleil qui se lève sur une ligne d'horizon |

Le corail `#B23C32` reste réservé à l'urgence. Le mode sombre a sa propre palette (forêt de nuit `#0A1412`). L'ancien style « verre et
photos » reste disponible en option (Profil › Apparence). Détail des jetons et composants : `DESIGN-SYSTEM.md` § Clairière.

Icônes de l'app (iOS 1024, Android adaptative et 6 densités, PWA, écran d'accueil), écrans de lancement et captures des stores ont été
régénérés avec le nouveau logo (`libre-app/scripts/render-assets.js`, sans outil externe).

## 2. Rapport UX/UI : comparaison avant / après

| Écran | Avant | Problème | Maintenant | Ce que l'utilisateur gagne |
|---|---|---|---|---|
| **Navigation** | 5 onglets ; « SOS » petite pastille en haut | L'aide immédiate est loin du pouce ; « Profil » prend un onglet | **Bouton Aide au centre** de la barre, sur chaque écran ; profil derrière l'avatar (initiale) de l'en-tête | L'aide est à un toucher, là où le pouce se trouve, à tout moment |
| **Bienvenue** (`bienvenue.jpg`) | Photo plein cadre sur fond sombre, texte blanc, liste | Premier contact sombre, lecture difficile | Fond clair, photo encadrée, « LIBRE » en serif, 4 promesses en tuiles, la confidentialité mise en évidence ; tout visible sans défiler (390 × 844) | Comprendre ce qu'est LIBRE, pour qui, comment elle aide et comment les données sont protégées en un regard |
| Inscription | Titres en gras sans serif | Rupture de style | Titres en serif ; parcours inchangé (déjà court et facultatif) | Cohérence |
| **Accueil** (`accueil.jpg`, `accueil-difficulte.jpg`) | Bloc principal bleu nuit | — | Bloc vert pin avec une lumière de lever de soleil ; carte de situation conservée | Identité cohérente, aide adaptée toujours en tête |
| **Journal** (`journal.jpg`, `journal-ecrire.jpg`) | Photo, liste plate, formulaire à 6 champs | Page blanche ; pas de vue d'ensemble ; ni émotions nommées, ni objectif | **Humeur de la semaine** (7 pastilles), **question du jour** (8 questions de réflexion guidée, « Une autre question »), entrées **groupées par jour** avec liseré de couleur d'humeur, formulaire guidé : humeur, émotions, pensées ou réponse à la question, difficultés, réussites, **intention pour demain**, envie, déclencheurs ; « Tout est facultatif » ; filtres repliés, recherche toujours visible | Écrire devient facile même sans idée ; on voit sa semaine d'un coup d'œil ; on prépare demain |
| **Statistiques** (`statistiques.jpg`) | Graphiques et tableaux | Il fallait interpréter seul | **« Ce que tes données montrent »** en tête : tendance de la semaine, jours sans, envies traversées, situation la plus fréquente, moment de la journée ; chaque constat a « Comment c'est calculé » ; mention « pas un diagnostic ni une prédiction » ; rien avant 14 jours de suivi | Comprendre ses chiffres sans effort, sans fausse certitude |
| **Bibliothèque** (`bibliotheque.jpg`) | 14 onglets horizontaux | Illisible sur mobile ; pas de thèmes | **11 thèmes** : comprendre les addictions, les envies, les déclencheurs, les émotions, le stress, les habitudes, les rechutes, la motivation, la reconstruction, le soutien de l'entourage, l'accompagnement professionnel ; chaque thème affiche son **objectif pédagogique** ; « Choisi pour toi » + 5 filtres par addiction | Trouver une information par question qu'on se pose, savoir ce qu'on va apprendre |
| Outils (`outils.jpg`) | — | En-têtes de section en serif majuscule | Corrigé | Lisibilité |
| Profil (`profil.jpg`) | Onglet | — | Accessible par l'avatar ; 3 sections conservées | Barre de navigation centrée sur l'essentiel |
| Aide immédiate (`aide-immediate.jpg`) | Pastille SOS | — | Bouton central ; parcours en 7 étapes conservé | — |
| Habitudes (`habitudes.jpg`) | — | — | Nouveau style | — |

## 3. Fonctionnalités ajoutées ou modifiées

1. Identité « Clairière » (jetons clair/sombre, typographie, cartes, boutons, logo, icônes, lancement, captures).
2. Barre de navigation : bouton Aide central (`.nav-help`, `data-a="sos"`), avatar de profil dans l'en-tête (`avatarBtn`).
3. Bienvenue reconstruite (`.welcome3`).
4. Journal : `J_PROMPTS`, `jPromptOfDay`, `jMoodWeek`, regroupement par jour, nouveaux champs facultatifs `emo`, `goal`, `prompt`.
5. Statistiques : `readingCard` (constats expliqués).
6. Bibliothèque : `LIB_THEMES` (11 thèmes, objectif pédagogique, fiches existantes), `artCard`.
7. Photos du journal et de la bibliothèque retirées (crédits et cache hors ligne mis à jour).

**Aucune fonctionnalité supprimée.** La pastille SOS est remplacée par le bouton central (même action) ; le profil reste accessible ;
la recherche et tous les filtres du journal restent ; les 14 catégories de la bibliothèque restent accessibles (thèmes + addictions).
**Aucune donnée perdue** : les nouveaux champs sont facultatifs, les anciennes entrées s'affichent telles quelles (test de migration
et tests du journal repassent).

## 4. Sécurité

Aucun mécanisme modifié. Détail : `SECURITE-FINALE.md` § 8.

## 5. Tests

84 tests automatisés réussis sur 84 (Chromium), dont 4 nouveaux (navigation, journal guidé, lecture expliquée, bibliothèque par
thèmes) et les 12 parcours. Contrastes AA et zones tactiles conformes, texte à 200 % sans débordement (fr, de). Android compilé
(debug, release, AAB), 12 tests unitaires, 0 erreur d'analyse. Détail : `TESTS-FINAUX.md` § 7.

## 6. Les questions finales, honnêtement

| Question | Réponse |
|---|---|
| Paraît-elle professionnelle ? | Oui à l'écran ; à confirmer par des personnes réelles |
| Identité cohérente ? | Oui : jetons uniques, tous les écrans, icônes et captures |
| Tous les écrans repensés ? | Identité appliquée partout ; bienvenue, navigation, journal, statistiques, bibliothèque reconstruits ce jour ; accueil, aide guidée, plans, profil reconstruits ce matin ; calendrier, bilans, « Mon corps », santé : nouveau style, structure conservée |
| Navigation intuitive ? | Plus directe (aide au centre) ; non vérifié avec des utilisateurs |
| Aides plus utiles ? | Journal guidé, lecture expliquée : oui ; efficacité clinique non mesurée |
| Aide trouvée rapidement ? | Un toucher depuis n'importe quel écran |
| Rechutes sans culpabilisation ? | Oui (inchangé, testé) |
| Statistiques compréhensibles ? | Oui, phrases + mode de calcul |
| Accessible ? | Contrastes, cibles, texte 200 % testés ; VoiceOver/TalkBack réels non testés |
| Données protégées ? | Oui, mécanismes inchangés |
| Fonctionnalités réelles ? | Oui, 84 tests |
| iOS et Android vérifiés ? | Android compilé ; **iOS non compilé** ; **aucun appareil réel** |
| Présentable publiquement ? | Visuellement oui ; **pas publiable** sans les actions de `ACTIONS-RESTANTES.md` (éditeur, marque, relecture médicale, essais sur appareils) |

## 7. Ce qui n'est pas fait

- Fiches « rôle de l'entourage » et « retrouver confiance » : toujours non écrites faute de sources vérifiables ici ; le thème
  « Le soutien de l'entourage » le dit à l'écran.
- Bibliothèque et « Mon corps » en anglais pour de/it/es/pt (inchangé).
- Pas de test utilisateur, pas d'essai sur téléphone, pas de VoiceOver/TalkBack réels.
- Les questions du journal et les objectifs des thèmes ne sont pas validés par un professionnel (`VALIDATION-MEDICALE.md`).
