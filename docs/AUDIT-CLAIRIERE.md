# Audit initial de la refonte « Clairière »

22 novembre 2026. Base : commit `a38a2d0` (étiquette `avant-refonte-v2`), c'est-à-dire LIBRE après la refonte intégrale du matin.
Méthode : lecture du code (`libre/index.html`, `sw.js`, projets `libre-app/`), parcours de tous les écrans dans Chromium, 36 captures
(`docs/ux/clairiere/avant/`), vérification des 193 actions `data-a`, relecture des aides et des textes. Les écrans déjà reconstruits le
matin (accueil adaptatif, aide guidée en 7 étapes, plans, profil en 3 sections) ont été réexaminés sans être considérés comme acquis.

## 1. Audit UX/UI écran par écran

| Écran | État actuel | Problèmes identifiés | Modifications prévues | Priorité |
|---|---|---|---|---|
| Identité globale | Direction « Horizon » : crème, encre bleu nuit, sauge, ambre | Correcte mais proche d'un modèle générique « bien-être » ; le bleu nuit donne un ton institutionnel ; le logo (feuille) ne dit rien de la liberté | Nouvelle identité « Clairière » : encre vert pin, fond brume, abricot chaud, titres en serif, nouveau logo (arc ouvert + soleil levant), nouvelles icônes d'app | P1 |
| Navigation | 5 onglets + pastille « SOS » dans l'en-tête | L'aide immédiate est un petit bouton en haut, loin du pouce ; « Profil » occupe un onglet alors qu'on y va rarement | Bouton **Aide** au centre de la barre, sur chaque écran ; profil derrière l'avatar de l'en-tête | P1 |
| Bienvenue | Photo plein cadre, fond bleu nuit, 4 promesses en liste | Texte blanc sur photo ; promesses en liste dense ; impression « sombre » au premier contact | Fond clair, photo encadrée, nom en serif, 4 promesses en tuiles (dont la confidentialité mise en avant), tout visible sans défiler sur un iPhone standard | P1 |
| Inscription | 6 étapes courtes, objectif, comportements, difficultés facultatives | Bon parcours ; titres en Inter gras, en rupture avec le reste | Titres en serif ; parcours conservé (il répond déjà aux exigences : objectif, comportement, préférences, difficultés facultatives, rappels, confidentialité) | P3 |
| Accueil | Carte de situation, bloc principal, outils | Bon fond ; style à aligner | Bloc principal vert pin avec lumière de lever de soleil ; cartes rayon 24 | P2 |
| **Journal** | Photo de couverture, bouton, recherche, filtres, liste plate, formulaire à 6 champs | Rien n'aide à écrire face à une page blanche ; aucune vue d'ensemble de l'humeur ; les entrées sont une liste uniforme ; pas d'« objectif » ni d'émotions nommées ; la photo prend un écran sans rien apporter | Question du jour (réflexion guidée), humeur de la semaine, entrées groupées par jour avec couleur d'humeur, formulaire guidé (émotions, pensées, difficultés, réussites, **intention pour demain**, déclencheurs), filtres repliés | P1 |
| **Statistiques** | Graphiques et tableaux complets | Les chiffres sont justes mais il faut les interpréter soi-même ; aucune phrase ne dit « ce que ça veut dire » | Carte « Ce que tes données montrent » : constats en phrases, chacun avec « Comment c'est calculé », mention « pas un diagnostic ni une prédiction », rien en dessous de 14 jours de suivi | P1 |
| **Bibliothèque** | 14 onglets horizontaux, photo, liste | Onglets illisibles sur mobile (défilement horizontal) ; pas d'entrée par thème ; pas d'objectif pédagogique | **11 thèmes** (ceux de la demande), chacun avec un objectif pédagogique ; filtres par addiction réduits à 5 ; thème sans fiche dédiée signalé honnêtement | P1 |
| Outils | Bonne organisation (aide, exercices, préparer la suite, ton espace) | En-têtes de section en serif majuscule (illisible) | Corrigé dans le nouveau style | P3 |
| Profil / paramètres | 3 sections (accompagnement, confidentialité, application) | Conforme à la demande ; style | Avatar dans l'en-tête ; style | P3 |
| SOS / aide immédiate | Parcours en 7 étapes, 6 rubriques de numéros | Conforme | Ouvert depuis le bouton central | P2 |
| Captures stores, icônes | Fond bleu nuit, ancien logo | Incohérent avec la nouvelle identité | Régénérés (icônes iOS/Android/PWA, écrans de lancement, captures) | P2 |

## 2. Audit fonctionnel

- **Boutons sans action** : aucun (les 193 `data-a` ont un gestionnaire).
- **Données non enregistrées** : aucune trouvée. Le journal n'avait pas de champ pour un objectif ni pour les émotions : ajoutés (`goal`, `emo`, `prompt`).
- **Incohérences** : la page Photographies créditait des photos (journal, bibliothèque) qui ne seront plus affichées : retirées du code, des crédits et du cache hors ligne.
- **Fonctions difficiles à trouver** : l'aide immédiate (petite pastille en haut) → bouton central. Les thèmes de la bibliothèque → grille.
- **Doublons** : « SOS » dans l'en-tête et « J'ai une envie » sur l'accueil ouvraient la même chose : la pastille est remplacée par le bouton central ; la carte d'accueil reste (grande cible, texte explicatif).
- **Défaut trouvé pendant la refonte** : la vue de l'humeur de la semaine marquait tous les jours comme remplis (attribut `style` vide) : trouvé par le nouveau test, corrigé.

## 3. Audit des aides

| Aide | Comprendre | Utiliser | Adaptée | Concrète | Fiable | Décision |
|---|---|---|---|---|---|---|
| Aide guidée 7 étapes | Oui | Oui | Oui (stratégie selon contexte) | Oui | Outils de soutien courants, non validés cliniquement | Conservée |
| Exercices (respiration, ancrage, surf, report, pensées, déclencheurs, plan) | Oui | Oui | Oui | Oui | Sources citées | Conservés |
| Journal | Oui | Page blanche | Non guidé | Peu | — | **Reconstruit** (questions de réflexion guidée) |
| Analyse du journal | Partielle | — | — | — | Calcul exact | Conservée, complétée par la lecture expliquée des statistiques |
| Bibliothèque | Oui | Difficile à parcourir | — | Oui | Sources et niveau de preuve | **Réorganisée** par thèmes avec objectifs |
| Plans par situation | Oui | Oui | Oui | Oui | — | Conservés |

## 4. Audit technique et sécurité

Aucun risque nouveau. Mécanismes inchangés : coffre AES-256-GCM natif (CryptoKit + Trousseau, Android Keystore), coffre web facultatif
(PBKDF2 600 000), sauvegardes chiffrées (format 5), CSP `connect-src 'self'`, voile de confidentialité, rappels discrets, journaux
désactivés, aucune connexion réseau. Les nouveaux champs du journal sont stockés dans le même état, donc chiffrés dans les apps. Les
identifiants (`ch.libre.app`), versions et permissions ne changent pas.

## 5. Plan d'action (exécuté)

1. Identité « Clairière » : jetons, typographie, cartes, boutons, logo, icônes, écrans de lancement, captures stores.
2. Navigation : bouton Aide central, avatar → profil.
3. Bienvenue reconstruite ; titres d'inscription harmonisés.
4. Journal reconstruit (vue et formulaire).
5. Statistiques : lecture expliquée.
6. Bibliothèque par thèmes.
7. Traductions (73 textes × 5 langues), tests (4 nouveaux tests, 84 au total), compilation Android, documents, archive.
