# LIBRE 21 « Verre de mer »

Refonte intégrale de l’identité et de l’interface. Elle remplace LIBRE 19 « Verre » et LIBRE 20 (organisation en 5 onglets). La copie complète de LIBRE 20 est conservée dans `livraison/archive/LIBRE-20-avant-refonte.html` (fichier autonome, à ouvrir tel quel) ; le tag git local `avant-libre-21` marque le dernier état d’avant.

## Direction

**Le changement comme un verre de mer** : une interface calme et givrée, une teinte par addiction, un chiffre clair par écran.

- Sol : sable mouillé le jour (`#F1F0EB`), mer de nuit en sombre (`#0A1315`).
- Matière : le verre, réservé à la couche qui flotte (barre d’onglets, en-tête, fenêtres, notifications) ; les panneaux de contenu portent seulement la tranche lumineuse du verre (bord supérieur clair). Jamais de verre empilé sur du verre.
- Couleur : celle de l’addiction (pastille, barre de progression, sélection, médailles) ; un seul corail réservé à l’Aide.
- Typographie : police du système (San Francisco sur iPhone), variante arrondie pour les titres et les chiffres, chiffres tabulaires.
- Mouvement : un seul geste par écran (la montée d’une feuille), aucune boucle sauf l’exercice de respiration ; rien quand le système demande moins d’animations.

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
- **Aujourd’hui** simplifié en quatre blocs : une carte du suivi (nom, mode Arrêt/Réduction/Observation, grand chiffre, prochaine étape sur une ligne, ligne « Aujourd’hui » avec − / +), le bandeau « J’ai une envie » avec deux liens discrets, le panneau du jour, la semaine. Les chiffres détaillés (économies, envies traversées…) sont dans **Progrès**. Un jour difficile : une seule suggestion à la fois.
- **Progrès** : un seul bouton « Noter » ouvre le choix (consommation, envie, humeur…).
- **Bienvenue** : le logo LIBRE, sobre.
- Toutes les vues (26) restylées avec les mêmes composants : groupes, lignes, repliables, champs, interrupteurs, sélecteurs segmentés, fenêtres, aide guidée, verrou.

## Fonctionnalités

### Ajoutées
- **Engagement du jour** (accueil, dans la carte du suivi) : inspiré du « daily pledge » d’I Am Sober. Le matin, « Je m’engage » (ne pas consommer, ou rester dans ma limite en réduction) ; à partir de 18 h, « As-tu tenu ton engagement ? » Oui / Pas cette fois. La réponse est seulement enregistrée (`tools.pledges`, par jour) : elle n’ajoute aucune consommation et ne remet aucun compteur à zéro. Absent en mode Observation. Fonctionne hors ligne ; les anciennes sauvegardes sans cette clé s’ouvrent normalement.
- **Ton année** (Progrès) : 52 barres fines, une par semaine, hauteur = jours tenus (sans consommer, ou dans la limite) ; total, meilleure semaine, semaine en cours. Données réelles uniquement (calcul `okDays`). Inspirée d’un composant de 21st.dev (« Heat Strip »), réécrite sans framework.
- **Affichage sobre** : l’interrupteur « Effets visuels » (Profil › Apparence) coupe le flou, rend les surfaces opaques et supprime les animations d’écran.

### Modifiées
- Option « look verre » de LIBRE 8 : sans objet (le verre est partout) ; les anciens profils qui l’avaient activée s’ouvrent normalement.
- Les panneaux « Pour toi, maintenant » ne s’ajoutent plus à une situation « journée difficile » (une seule suggestion).

### Retirées
- **Code de la page « Vue d’ensemble »** (`viewOverview`) : doublon exact de Progrès, déjà inaccessible (redirigée vers Progrès depuis LIBRE 11). La redirection de `#apercu` est conservée pour les anciens liens.
- **Le galet de verre** (`pebbleSVG`, `polishOf`), d’abord pensé comme signature : jugé peu professionnel par la personne propriétaire, il est retiré partout (accueil, bienvenue, listes, barre latérale). Aucune donnée n’en dépendait.
- **Cartes de chiffres de l’accueil** : déplacées, pas supprimées ; les mêmes chiffres sont dans Progrès.
- **Photos d’illustration** (banque d’images Pexels : une soignante masquée, un sablier, une main qui écrit) : génériques, sans lien avec la personne. Les fichiers restent dans `libre/photos/` ; un drapeau (`PHOTOS_ON`) permet de les réafficher. Les photos personnelles de « Mes motivations » ne sont pas concernées.
- **Police Inter** : remplacée par la police du système.

### Corrigées
- Graphiques : un libellé de date près du bord n’est plus coupé.
- Médailles des étapes : le nombre (jours ou mois) est de nouveau affiché.
- Les listes « Jour de… à… » du thème « selon l’heure » n’étaient reliées à aucune action : elles fonctionnent.
- Libellés de graphiques illisibles (8,5 px) : au moins 11 px réels, et les libellés qui se chevauchent sont masqués.
- Couleur de thème du navigateur (barre d’état) alignée sur le thème clair ou sombre réellement affiché.

## Comparaison avec le marché
Applications regardées : Smoke Free, QuitNow!, Kwit, I Am Sober, Reframe, Sunnyside (fiches App Store et revues publiques). LIBRE couvrait déjà l’essentiel : journal des envies avec contexte, frise de santé (« Mon corps »), économies, étapes, programme, réduction, aide guidée et numéros d’urgence. Ajouté : l’engagement du jour. Écartés pour l’instant : communauté et discussion (Internet et modération nécessaires), carte des envies par GPS (donnée sensible), abonnements et coachs payants, médicaments sur ordonnance (hors du rôle de LIBRE).

## Graphiques et Liquid Glass (LIBRE 21.2)
Demande : plus de graphiques, plus précis, avec de vrais chiffres et moins de texte ; encore plus de Liquid Glass. Skills utilisés : `dataviz` (règles de graphiques), `/unslop` (mode retouche), `/apple-design` (matériaux, typographie), `/find-skills` (aucun skill de graphiques trouvé sur skills.sh pour « charts », « dataviz », « data visualization »).
- **Accueil** : l’en-tête se limite à la date et au prénom ; le message de motivation qui suivait est retiré de l’écran (il reste envoyé en notification « Message du jour », réglage « motivation »). Un anneau « Activité » (progression vers la prochaine étape, en %) remplace la barre fine ; en réduction avec limite, la barre reste. La ligne « Depuis le dernier arrêt » est masquée au-delà de 2 jours (elle répétait le chiffre).
- **Progrès** :
  - **Argent économisé** : courbe cumulée semaine par semaine (calcul `savedOf`), 3, 6 ou 12 mois.
  - **Quand arrivent tes envies** : envies notées sur 90 jours, par tranches de 4 heures.
  - Le graphique « Consommation par semaine » n’apparaît plus en arrêt quand la période ne compte aucune consommation (il était vide) ; il reste en réduction et dans Statistiques détaillées.
  - Sous-titres raccourcis (« 14 jours · de 1 à 5 »), état vide « Pas encore de données ».
- **Règles appliquées à tous les graphiques** (`areaChart`, `v7Bars`, `bars`) :
  - axe arrondi au plus près (`niceTop` : la courbe remplit le cadre) ;
  - grille en filets pleins ;
  - ligne de 2 px, voile à 10 % ;
  - point final cerclé avec sa valeur ;
  - barres de 24 px au plus, arrondies en haut, carrées sur la ligne de base ;
  - valeur écrite seulement sur la plus haute et la plus récente, les autres au survol ;
  - texte toujours en encre de texte ;
  - échelles fixes pour le moral (5) et l’intensité (10).
- **Corrigé** : les barres de Statistiques détaillées s’affichaient comme des tirets sombres (une règle CSS de jauge s’appliquait aux barres SVG, et leurs couleurs n’étaient pas définies) ; la grille et la bulle d’information des courbes n’avaient aucun style.
- **Liquid Glass** :
  - jetons `--lg-fill`, `--lg-blur`, `--lg-rim`, `--lg-drop` et `--lg-ctl` ;
  - tranche spéculaire (lumière en haut à gauche, reflet en bas à droite) et lueur interne ;
  - appliqué aux panneaux, à la carte de l’accueil, aux boutons discrets, sélecteurs, puces et au bouton « − ».
- **Lumière de fond** :
  - la teinte de l’addiction, diffuse et fixe, que le verre floute au défilement. Elle était déjà prévue, mais un fond opaque sur `body` la masquait.
  - Désactivée en affichage sobre et quand le système demande moins de transparence.

### Goutte de verre manipulable (LIBRE 21.2)
Comme la barre d’onglets d’iOS 26 :
- presser le choix actif (onglet du bas, sélecteur de suivi, période 3/6/12 mois, filtres) soulève la goutte en lentille de verre claire ;
- la faire glisser la déplace sous le doigt : elle prend la largeur de l’élément le plus proche et résiste aux bords ;
- la lâcher choisit cet élément ;
- un simple toucher garde son comportement ;
- avec moins d’animations demandé par le système, la goutte bouge sans effet de loupe.

Verre étendu : les raccourcis « J’ai besoin d’aide » et « Ajouter une activité » sont des capsules de verre, « Mon objectif d’épargne » un panneau de verre. L’anneau de l’accueil est en Liquid Glass : tube de verre éclairé en haut à gauche, arc de la teinte avec un reflet, pourcentage posé sur un disque de verre.

Lentille de verre (`--lg-lens`) : le choix actif de chaque sélecteur (suivis, périodes, filtres, connexion e-mail/téléphone), l’onglet actif de la barre et le bouton des interrupteurs sont une lentille de verre plus claire, avec tranche spéculaire et ombre douce, en clair comme en sombre. Les choix actifs colorés (cases, humeurs, jours, options) reçoivent un reflet de verre teinté.

Corrigé en même temps : les listes de cases à choix multiples de l’inscription (« Qu’est-ce qui est le plus difficile », « Pourquoi tu fais ça ? ») étaient rognées en cercle, parce qu’elles recevaient le style des sélecteurs à goutte.

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
  - les six autres ont été appliquées : sur-titre retiré, salutation réduite, pastilles dans les listes, médailles en verre plutôt qu’en faux métal, en-tête allégé.
- **Deuxième passage** : verdict « fix ». Une seule action forte par écran, les médailles et le mode sombre sont réglés. Il reste deux points : le verre des panneaux en clair, et la ligne de 4 chiffres. Les deux ont été retravaillés ensuite : dégradé de lumière et tranche marquée pour l’un, grille 2 × 2 pour l’autre.
- **Ce dernier ajustement n’a pas été revu une troisième fois.** En clair, sur fond de sable uni, un panneau de verre reste proche d’une carte claire : c’est la limite de la matière quand rien ne passe derrière.

## Skills utilisés
- `/find-skills` : registre skills.sh ouvert dans l’environnement ; installés et lus avant usage : `impeccable` (direction, contrat, revue finale), `accessibility` et `performance` (Addy Osmani), `webapp-testing` (Anthropic).
- `/apple-design`, `/unslop` : principes appliqués (matériaux, typographie, retour à la pression, mouvement réduit ; une seule action forte, pas de sur-titres décoratifs, pas d’orbes brillantes).
- `21st:21st-ui` : recherche de références (barres d’onglets en verre, respiration, onboarding, suivi d’habitude) et récupération du code « Heat Strip ».

## Limites connues
- Le script de l’app pèse encore ≈ 2,6 Mo, surtout à cause des traductions de 20 langues : au-delà du budget conseillé par le skill performance. Les découper demanderait de charger les langues à la demande (hors ligne compris) ; à faire dans une version dédiée.
- Le tirage de direction d’`impeccable` a fonctionné en mode réduit (service de tirage injoignable) : pas de planches de référence.
- La réfraction du verre (filtre SVG) ne fonctionne que dans les navigateurs Chromium ; ailleurs, le verre est flou sans réfraction.
