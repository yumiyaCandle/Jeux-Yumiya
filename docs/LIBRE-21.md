# LIBRE 21 « Verre de mer »

Refonte intégrale de l’identité et de l’interface. Elle remplace LIBRE 19 « Verre » et LIBRE 20 (organisation en 5 onglets). La copie complète de LIBRE 20 est conservée dans `livraison/archive/LIBRE-20-avant-refonte.html` (fichier autonome, à ouvrir tel quel) ; le tag git local `avant-libre-21` marque le dernier état d’avant.

## Direction

**Le changement comme un verre de mer** : un éclat coupant devient, avec le temps, lisse, givré et lumineux. Chaque addiction est représentée par son galet, de sa couleur, que les jours tenus polissent.

- Sol : sable mouillé le jour (`#F1F0EB`), mer de nuit en sombre (`#0A1315`).
- Matière : le verre, réservé à la couche qui flotte (barre d’onglets, en-tête, fenêtres, notifications) ; les panneaux de contenu portent seulement la tranche lumineuse du verre (bord supérieur clair). Jamais de verre empilé sur du verre.
- Couleur : celle de l’addiction (galet, barre de progression, sélection) ; un seul corail réservé à l’Aide.
- Typographie : police du système (San Francisco sur iPhone), variante arrondie pour les titres et les chiffres, chiffres tabulaires.
- Mouvement : un seul geste par écran (l’arrivée du galet, la montée d’une feuille), aucune boucle sauf l’exercice de respiration ; rien quand le système demande moins d’animations.

Fiche produit : `PRODUCT.md`. Contrat de direction : `.impeccable/surfaces/libre-index-html.md`. Système de design documenté : `DESIGN.md`.

## Ce qui change

### Code
- **Une seule feuille de style** (≈ 55 Ko) remplace les 487 Ko de CSS empilés par LIBRE 7 à 20 (2 521 `!important`, sélecteurs du type `html:root:not(.fx):not(.zz):not(.zy):not(.zx)`). Elle est organisée en sections : jetons, base, verre, typographie, groupes, commandes, navigation, fenêtres, écrans, mouvement et accessibilité.
- Poids : `index.html` 3,33 Mo → 2,9 Mo ; version autonome compressée 1,66 Mo → 0,99 Mo.
- Plus de police web (Inter) ni de photos de banque d’images à charger ; le service worker ne les précharge plus (nouvelle version de cache).

### Navigation
Cinq onglets : **Aujourd’hui · Progrès · Aide (au centre, en corail) · Mon plan · Profil**.
- « Comprendre » est rangé dans **Mon plan**, qui y menait déjà ; Mon plan regroupe plan de prévention, raisons, déclencheurs, stratégies, motivations, Mon corps et Comprendre.
- « Aide » regroupe M’aider maintenant, les envies et la page santé.
- Le bouton retour porte le nom de la page où il ramène (fini l’ancien « Soutien »).
- Ordinateur : barre latérale de verre, repliable ; colonne de contenu lisible (≈ 740 px).

### Écrans
- **Aujourd’hui** reconstruit autour du galet : le chiffre principal à côté, la prochaine étape dessous, puis la ligne « Aujourd’hui » qui se note d’un geste. Salutation plus discrète. Chiffres en une ligne sur le sable (plus de cartes). Un jour difficile : une seule suggestion à la fois.
- **Bienvenue** : un galet poli remplace le grand logo.
- Toutes les vues (26) restylées avec les mêmes composants : groupes, lignes, repliables, champs, interrupteurs, sélecteurs segmentés, fenêtres, aide guidée, verrou.

## Fonctionnalités

### Ajoutées
- **Le galet** (signature) : `pebbleSVG()` dessine un éclat de verre à 7 côtés, propre à chaque suivi ; `polishOf()` mesure le chemin (arrêt : jours depuis le début, sur une échelle logarithmique d’un an ; réduction ou observation : part des jours tenus de la semaine). Plus le chemin avance, plus le verre est clair, lisse et lumineux. Petits galets dans le sélecteur de suivi, la barre latérale et la liste des suivis. Décoratif : le chiffre et la barre de progression restent le contenu accessible.
- **Ton année** (Progrès) : 52 barres fines, une par semaine, hauteur = jours tenus (sans consommer, ou dans la limite) ; total, meilleure semaine, semaine en cours. Données réelles uniquement (calcul `okDays`). Inspirée d’un composant de 21st.dev (« Heat Strip »), réécrite sans framework.
- **Affichage sobre** : l’interrupteur « Effets visuels » (Profil › Apparence) coupe le flou, rend les surfaces opaques et supprime les animations d’écran.

### Modifiées
- Option « look verre » de LIBRE 8 : sans objet (le verre est partout) ; les anciens profils qui l’avaient activée s’ouvrent normalement.
- Les panneaux « Pour toi, maintenant » ne s’ajoutent plus à une situation « journée difficile » (une seule suggestion).

### Retirées
- **Photos d’illustration** (banque d’images Pexels : une soignante masquée, un sablier, une main qui écrit) : génériques, sans lien avec la personne. Les fichiers restent dans `libre/photos/` ; un drapeau (`PHOTOS_ON`) permet de les réafficher. Les photos personnelles de « Mes motivations » ne sont pas concernées.
- **Police Inter** : remplacée par la police du système.

### Corrigées
- Les listes « Jour de… à… » du thème « selon l’heure » n’étaient reliées à aucune action : elles fonctionnent.
- Libellés de graphiques illisibles (8,5 px) : au moins 11 px réels, et les libellés qui se chevauchent sont masqués.
- Couleur de thème du navigateur (barre d’état) alignée sur le thème clair ou sombre réellement affiché.

## Vérifications

- `node tests/run.js` : 116 tests (dont les 5 scénarios de LIBRE 20). Tests adaptés : navigation LIBRE 21, effets visuels désactivables, ancien profil « verre ».
- `npm run -s check:contrast` et `npm run -s check:targets` : conformes.
- axe-core 4.10 (WCAG 2.0/2.1/2.2 A et AA) sur 18 écrans clair et sombre : 0 violation.
- `node tests/accounts.js` (vrai serveur) : 10/10 ; `npm run -s test:server` : 8/8.
- `python3 tools/i18n.py audit` : 0 texte manquant en en, de, it, es, pt.
- Mesures de laboratoire (processeur ×4, 4G simulée, médiane de 3) : LCP 3,11 s → 2,38 s ; tâches longues 678 → 565 ms ; CLS 0.

## Revue finale (impeccable)
Un réviseur indépendant, sans l’historique de la refonte, a examiné les captures téléphone et ordinateur en trois passages.
- **Premier passage** : verdict « fix ». Huit corrections lui ont été soumises :
  - deux ont été contestées, avec justification acceptée par le réviseur :
    - l’onglet Comprendre est intégré à Mon plan, car la navigation pouvait être repensée ;
    - les chiffres et l’accès rapide de l’accueil sont gardés, car ils sont demandés dans le brief LIBRE 20 ;
  - les six autres ont été appliquées : sur-titre retiré, salutation réduite, petits galets dans les listes, médailles en verre plutôt qu’en faux métal, lumière du galet, en-tête allégé.
- **Deuxième passage** : verdict « fix ». Une seule action forte par écran, le galet, les médailles et le mode sombre sont réglés. Il reste deux points : le verre des panneaux en clair, et la ligne de 4 chiffres. Les deux ont été retravaillés ensuite : dégradé de lumière et tranche marquée pour l’un, grille 2 × 2 pour l’autre.
- **Ce dernier ajustement n’a pas été revu une troisième fois.** En clair, sur fond de sable uni, un panneau de verre reste proche d’une carte claire : c’est la limite de la matière quand rien ne passe derrière.

## Skills utilisés
- `/find-skills` : registre skills.sh ouvert dans l’environnement ; installés et lus avant usage : `impeccable` (direction, contrat, revue finale), `accessibility` et `performance` (Addy Osmani), `webapp-testing` (Anthropic).
- `/apple-design`, `/unslop` : principes appliqués (matériaux, typographie, retour à la pression, mouvement réduit ; une seule action forte, pas de sur-titres décoratifs, pas d’orbes brillantes).
- `21st:21st-ui` : recherche de références (barres d’onglets en verre, respiration, onboarding, suivi d’habitude) et récupération du code « Heat Strip ».

## Limites connues
- Le script de l’app pèse encore ≈ 2,6 Mo, surtout à cause des traductions de 20 langues : au-delà du budget conseillé par le skill performance. Les découper demanderait de charger les langues à la demande (hors ligne compris) ; à faire dans une version dédiée.
- Le tirage de direction d’`impeccable` a fonctionné en mode réduit (service de tirage injoignable) : pas de planches de référence.
- La réfraction du verre (filtre SVG) ne fonctionne que dans les navigateurs Chromium ; ailleurs, le verre est flou sans réfraction.
