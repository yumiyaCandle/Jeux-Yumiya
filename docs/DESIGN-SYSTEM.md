# Système de design LIBRE

Ce document décrit ce que le code utilise réellement (`libre/index.html`, feuille de style en tête de fichier).
Toute nouvelle interface doit réutiliser ces jetons et composants plutôt que d'en créer d'autres.

## 1. Jetons (variables CSS)

Les valeurs changent selon le thème (clair, sombre) et la couleur d'accent choisie dans Profil › Apparence
(`html[data-accent="vert|lagon|indigo|corail"]`). Les noms restent les mêmes.

| Rôle | Jetons | Usage |
|---|---|---|
| Fonds | `--bg`, `--card`, `--field`, `--line`, `--edge` | Fond de page, cartes, champs et pistes, séparateurs, liseré clair des surfaces |
| Texte | `--ink`, `--muted` | Texte principal ; texte secondaire (contraste ≥ 4,5:1 vérifié par test) |
| Accent | `--green`, `--green-strong`, `--green-soft`, `--green-ink` | Actions principales, progrès, jours sans. Le nom « green » est historique : il suit l'accent choisi |
| États | `--amber`, `--amber-soft`, `--red` | Consommation ou attention ; action destructrice |
| Graphiques | `--bar`, `--ring1`, `--ring2`, `--ring3` | Barres neutres ; anneaux de la semaine (palette validée pour le daltonisme, clair et sombre) |
| Formes | `--r` (18 px), `--r-card` | Rayon des champs et petites cartes ; rayon des grandes cartes |
| Profondeur | `--sh-1`, `--glass-a`, `--glass-b` | Ombre des cartes ; matière « verre » (effets visuels activés) |
| Mouvement | `--ease`, ressorts `spring(…, {response:.3, damping:1})` | Transitions ; feuilles et contrôles qu'on manipule au doigt |

## 2. Typographie

- **Inter** (incluse dans l'app, aucune police chargée depuis Internet) pour tout le texte.
- **Serif italique** (`--font-serif`) réservée à un mot clé par écran (prénom, raison principale) : elle humanise, elle n'est pas un titre.
- Échelle : titre d'écran `h1` 1,75 à 2 rem, interlettrage négatif (−0,025 à −0,035 em) ; titre de carte `h2` 1,15 rem ;
  corps 1 rem, interligne 1,5 ; texte secondaire 0,88 rem ; surtitres en petites capitales espacées.
- Les chiffres qui changent (compteurs, statistiques) utilisent des chiffres tabulaires pour ne pas « sauter ».

## 3. Composants

| Composant | Classe | Règles |
|---|---|---|
| Bouton | `.btn` + `primary` / `quiet` / `ghost` / `danger`, taille `sm` | Pilule. 52 px de haut (44 px en `sm`), retour visuel à l'appui (`scale(.97)`). Un seul `primary` par écran ou feuille ; `danger` uniquement pour une action qui efface |
| Bouton icône | `.iconbtn` | 40 × 40 px minimum, toujours un `aria-label` |
| Carte | `.card`, `.hm-p` | Fond `--card`, rayon `--r-card`, ombre `--sh-1`. Pas de carte dans une carte |
| Ligne de liste | `.li`, `.tool-row` | Texte à gauche, action à droite ; le texte se coupe proprement (jamais de débordement) |
| Contrôle segmenté | `.segc` | Curseur qui glisse ; libellés courts sous 400 px (« 7 j ») avec libellé complet pour les lecteurs d'écran |
| Filtres | `.seg` (`.seg-row` pour une seule ligne qui défile) | Puces ; l'état choisi est indiqué par une coche, pas seulement par la couleur |
| Feuille | `.sheet` | Monte du bas, se ferme en glissant vers le bas (vitesse du doigt reprise, résistance élastique vers le haut), repart par le même chemin. Matière plus dense que les cartes |
| Message | `.notice` | Icône + texte ; information importante ou mise en garde |
| Notification visuelle | `toast` | En bas, s'efface seule ; propose « Annuler » quand l'action est réversible |
| Navigation | `.nav` | 5 onglets, barre flottante en pilule sur téléphone ; SOS toujours en haut à droite |
| Graphique | `bars()`, `.chart-w` | Barres arrondies en haut, posées à plat ; lecture au doigt ou au clavier ; « aujourd'hui » marqué par la couleur **et** un libellé en gras souligné |

## 4. Règles d'interaction

- Retour immédiat à l'appui ; haptique (natif) seulement pour les actions qui comptent : enregistrer, valider un objectif, une étape SOS.
- Confirmation uniquement avant d'effacer ; ailleurs, « Annuler » dans la notification.
- `prefers-reduced-motion` : plus d'animation d'écran ; `prefers-reduced-transparency` : surfaces opaques ; `prefers-contrast: more` : bordures franches.
- Une information n'est jamais portée par la couleur seule (calendrier hachuré, coche sur les filtres, libellé en gras dans les graphiques).
- Cibles tactiles ≥ 24 px (WCAG 2.2), en pratique 40 à 52 px.

## 4 bis. Version 4

- Les lignes `.row.between` peuvent passer à la ligne (texte agrandi) **sauf** l’en-tête du calendrier « ‹ mois › », qui reste sur une ligne (régression de la version 3 corrigée, test à 320 px en fr, it, de).
- Captures vérifiées à l’œil sur 7 configurations : 320 px clair (fr), 360 px sombre (en), 375 px texte à 150 % (it), 390 px sombre (pt), 393 px sombre (fr), 412 px clair (es), 430 px clair (de).
- 21st.dev (états vides, parcours de premier lancement) : composants React + Tailwind ; LIBRE a déjà des états vides rédigés et un premier lancement court. Rien d’importé.

## 5. Comparaison et choix (version 3)

| Sujet | LIBRE avant | Recommandation Apple Design (skill) | Composants 21st.dev étudiés | Résultat |
|---|---|---|---|---|
| Feuilles | Ressort, vitesse reprise, résistance, sortie symétrique | Identique (WWDC « Designing Fluid Interfaces ») | — | Conservé ; matière de la feuille épaissie et en-tête de même matière (il était opaque et d'une autre teinte) |
| Contrôles segmentés | Curseur glissant ; « 12 mois » coupé à 320-375 px | Libellés courts comme l'app Santé (J S M 6M A) | « Segmented Control », « Segmented Tabs » (React + Framer Motion) | Libellés courts sous 400 px, test automatique dans 6 langues |
| Haptique | Une faute de nom privait l'enregistrement d'une habitude de retour | Haptique seulement sur les actions qui comptent | — | Corrigé |
| Graphiques et calendrier | Aujourd'hui en vert ; jours avec consommation en ambre | Ne pas dépendre de la couleur | « Activity Heatmap », « Habit Tracker Calendar » | Libellé en gras souligné ; hachures ; total du mois déjà présent |
| Cartes de mesures | Cartes avec chiffres et anneaux | — | « Health Stat Card », « Activity Card » | Déjà équivalent ; rien d'importé |
| Journal | 6 filtres sur 3 lignes | Simplicité : moins de place pour les filtres | — | Une ligne qui défile |

Aucun composant 21st.dev n'a été intégré : tous dépendent de React, Tailwind et Framer Motion. Les ajouter imposerait
un outil de compilation et plusieurs bibliothèques à une app qui n'en a aucune, pour des fonctions déjà présentes.

## Direction « Horizon » (par défaut depuis la transformation du 22 novembre 2026)

Remplace le style « verre et photos » comme style par défaut (ce dernier reste une option : Profil › Apparence › Effets visuels).
Couche CSS « HORIZON » à la fin de la feuille de style de `libre/index.html`, active quand `html` n'a pas la classe `fx`.

| Jeton | Clair | Sombre | Usage |
|---|---|---|---|
| `--bg` | `#F4F1EA` (lin) | `#0C121D` | Fond |
| `--card` | `#FFFFFF` | `#141C2A` | Surfaces |
| `--ink` | `#152238` | `#ECE8E1` | Texte, action principale |
| `--muted` | `#5C6473` | `#9CA4B1` | Texte secondaire (≥ 4,5:1) |
| `--line` | `#E5DFD4` | `#243044` | Filets |
| `--green` / `--green-strong` | `#3F7F6E` / `#2E6A5B` | `#7DB9A7` / `#8DC6B4` | Progression, liens |
| `--amber` | `#B7772F` | `#E0A866` | Ce qui se gagne |
| `--sos` | `#B9443C` | `#E0776E` (boutons d'urgence : `#A8372F`) | Aide urgente uniquement |
| `--hz-line` | dégradé `#E3A45E → #DB9171 → #8DB9A9 → #3F7F6E` | idem | Signature : ligne d'horizon |

Règles : une seule couleur d'action (encre pleine, claire sur fond sombre) ; surfaces pleines, filet 1 px, ombre douce, rayon 20 px ;
pas de flou ; serif italique réservé aux mots qui comptent ; chiffres tabulaires ; barre d'onglets ancrée ; feuilles modales pleines ;
aucun décor sans information. Vérifié par `npm run check:contrast` (AA) et `npm run check:targets` (≥ 24 px).

## Design system v2 (refonte intégrale)

**Échelles** (jetons CSS sur `:root`, direction Horizon) :

| Famille | Jetons |
|---|---|
| Espacement | `--sp-1` 4 · `--sp-2` 8 · `--sp-3` 12 · `--sp-4` 16 · `--sp-5` 20 · `--sp-6` 24 · `--sp-7` 32 · `--sp-8` 40 px |
| Rayons | `--r-xs` 8 · `--r-sm` 12 · `--r-md` 16 · `--r-card` 20 · `--r-pill` 999 |
| Texte | `--fs-xs` .78 · `--fs-sm` .88 · `--fs-md` 1 · `--fs-lg` 1.25 · `--fs-xl` 1.6 · `--fs-2xl` 2.2 · `--fs-hero` 4 rem ; interlignage `--lh-tight` 1.1, `--lh-body` 1.5 |
| Mouvement | `--t-fast` 120 ms · `--t-base` 220 ms · `--ease` cubic-bezier(.2,.8,.2,1) ; tout est coupé si l'appareil demande moins d'animations |

**Couleurs fonctionnelles** : réussite = sauge (`--green*`) ; gain = ambre (`--amber`) ; alerte et urgence = corail (`--sos`, `--sos-soft`) ;
information = encre et `--muted`. Jamais la couleur seule : toujours un mot, une coche ou une icône.

**Composants** (classes) :

| Composant | Classe | Règle |
|---|---|---|
| Bouton principal / secondaire / discret | `.btn.primary` / `.btn.ghost` / `.btn.quiet` | Une seule action principale par écran ; ≥ 44 px |
| Lien | `.link` | Zone de toucher ≥ 44 px (pseudo-élément) |
| Carte | `.hm-p`, `.card` | Surface pleine, filet, rayon 20 |
| Carte de situation | `.hm-sit` (+ `.sit-hard`, `.sit-slip`, `.sit-new`, `.sit-goal`) | Une seule à la fois, en tête de l'accueil |
| Liste d'étapes | `.hm-steps` | Cochée automatiquement à partir des données |
| Choix | `.seg button`, `.choice`, `.opt` | `aria-pressed` ; sélectionné = sauge pâle + contour |
| Stratégie (aide guidée) | `.s5-strat` (`.reco` = recommandée) | 2 recommandées, autres repliées |
| Feuille modale | `.sheet` | Pleine, voile derrière, poignée |
| Numéro d'urgence | `.em-btn` | Corail profond, texte blanc ≥ 4,5:1 |
| États vides | `.hm-empty`, textes « Aucune … » | Toujours une action proposée |
| Erreurs | `toast()` | Titre + phrase qui dit quoi faire |
| Notifications | centre `notifCenter` | Textes discrets par défaut |

## Design system « Clairière » (identité par défaut depuis le 22 novembre 2026)

Remplace « Horizon » comme style par défaut (bloc CSS « CLAIRIÈRE » à la fin de `libre/index.html`, sélecteurs `html:not(.fx)`).
Les échelles v2 (espacements, rayons, texte, mouvement) ci-dessus restent valables. Intention et justification : `REFONTE-CLAIRIERE.md` § 1.

### Palettes

| Rôle | Jeton | Clair | Sombre |
|---|---|---|---|
| Fond | `--bg` | `#F1F3EE` brume | `#0A1412` forêt de nuit |
| Surface | `--card` | `#FFFFFF` | `#12201D` |
| Encre / action principale | `--ink` | `#12302A` vert pin | `#E8EEEA` |
| Texte secondaire | `--muted` | `#53635C` | `#9DB1A8` |
| Filet / bordure | `--line` | `#DCE3DB` | `#22342F` |
| Champ | `--field` | `#E8EDE6` | `#192A26` |
| Bloc principal | `--navy` / `--navy-2` | `#123A33` / `#1A4A41` | `#0F2A25` / `#163A33` |
| Secondaire chaud (décor) | `--apricot` | `#E8915F` | `#E8915F` |
| Réussite / progression | `--green`, `--green-strong`, `--green-soft`, `--green-ink` | `#2E7B5A` … | `#71C79E` … |
| Gain / attention douce | `--amber`, `--sun-soft`, `--sun-ink` | `#A35B1E` … | `#E3A06B` … |
| Alerte / urgence (réservé) | `--sos`, `--sos-soft` | `#B23C32` | `#E0584E` |
| Graphiques | `--bar` ; anneaux `--ring1..3` | `#5B8F7B` | `#6FA790` |
| Signature | `--hz-line` | dégradé abricot → sauge | idem |

### Typographie

Titres de page, de carte et de feuille : `--font-title` (Iowan Old Style, Palatino, Georgia : polices du système, rien à télécharger),
graisse 500–600. Texte et interface : Inter (fichiers locaux). Grand titre `clamp(2rem, 7.6vw, 2.45rem)`, interligne 1,08. Petites
capitales d'en-tête (`.eyebrow`) : Inter, espacement 0,12 em, couleur sauge. Chiffres : tabulaires (`.num`).

### Formes, ombres, bordures

Cartes : rayon 24, filet 1 px `--line`, ombre `--sh-1` à peine perceptible (clair) ou aucune (sombre). Tuiles : rayon 18.
Boutons : pilule (999). Bloc principal : vert pin + deux halos (abricot en haut à droite, sauge en bas à gauche).

### Composants

| Composant | Classe | Règle |
|---|---|---|
| Barre de navigation | `.nav` + `.nav-help` | 4 destinations + bouton **Aide** central (54 px, encre, anneau couleur du fond) ; sur ordinateur, barre latérale |
| Avatar de profil | `.avatar-btn` | Initiale du prénom (ou pictogramme), 44 px de zone tactile, `aria-current` sur le profil |
| Logo | `logoMark()` | Arc ouvert + horizon + soleil abricot ; jamais fermé |
| Bienvenue | `.welcome3`, `.w3-*` | Photo encadrée, nom en serif, 4 tuiles, bouton collant en bas |
| Question du journal | `.j3-prompt`, `.j3-q` | Fond sauge pâle, question en serif |
| Humeur de la semaine | `.j3-week` | 7 pastilles ; vide = cercle pointillé ; jamais la couleur seule (titre et libellé) |
| Entrée de journal | `.jentry.j3` | Liseré gauche de la couleur d'humeur, heure, libellé d'humeur, étiquettes Réussite / Difficulté / Intention |
| Lecture des données | `.rd3` | Constat en phrase + « Comment c'est calculé » (`details`) + rappel « pas un diagnostic » |
| Thème de bibliothèque | `.lib3-t`, `.lib3-head` | Icône, titre, nombre de fiches ; page du thème : objectif pédagogique |
| Champs de saisie | `.field`, `textarea`, `input` | Libellé visible au-dessus, icône facultative (`.j3-blk`), exemple en texte indicatif |
| Modales | `.sheet` | Titre en serif, poignée, voile |
| Menus repliables | `details` (`.fold`, `.j3-tools`) | Résumé ≥ 44 px, état conservé |
| Chargement | Aucun écran de chargement réseau (tout est local) ; les photos ont un fond dégradé pendant le décodage (`.ph`) | — |
| États vides | Phrase + action (journal vide, statistiques « Encore quelques jours de suivi ») | Toujours une suite possible |
| Erreurs | `toast()` titre + phrase d'action ; feuilles de confirmation pour les actions définitives | — |
| Notifications | Centre `notifCenter`, cloche avec pastille corail | Textes discrets par défaut |

### Icônes d'application et lancement

Produites par `libre-app/scripts/render-assets.js` : fond `#123A33`, logo `#F1F3EE` + soleil `#E8915F`. Icône adaptative Android
(premier plan dans la zone sûre, fond vert pin), icône iOS 1024 sans transparence, icônes PWA (dont « maskable »).

## Design system « Envol » (identité par défaut depuis la reconstruction du 22 novembre 2026)

Remplace « Clairière » (bloc CSS « ENVOL » à la fin de `libre/index.html`, sélecteurs `html:not(.fx)`). Justification :
`REFONTE-ENVOL.md` § 1.

### Palettes

| Rôle | Jeton | Clair | Sombre |
|---|---|---|---|
| Fond | `--bg` | `#F4F3F9` | `#0C0B1C` |
| Surface | `--card` | `#FFFFFF` | `#171630` |
| Texte | `--ink` / `--muted` | `#1A1838` / `#5D5A78` | `#EDEBFA` / `#A6A3C6` |
| Action principale | `--accent`, `--accent-ink`, `--accent-soft`, `--accent-strong` | `#4B3FD8` sur blanc | `#8C84FF` (texte `#0C0B1C`) |
| Réussite | `--green*` | `#13896B` | `#4FD1A8` |
| Gain / attention douce | `--amber`, `--sun-soft`, `--sun-ink` | `#A3570F` | `#F2AE6B` |
| Urgence (réservé) | `--sos`, `--sos-soft` | `#C8283E` | `#F0566B` |
| Aube (décor, logo) | `--apricot` | `#FF9A6B` | `#FF9A6B` |
| Bandeaux | `--tone-dawn`, `--tone-teal`, `--tone-rose`, `--tone-sky`, `--tone-night` | dégradés nuit → indigo + halo | idem |
| Barre d'état | `--hd` | `#1E1A55` | `#110F2E` |

### Typographie

Inter uniquement (fichiers locaux). Grand titre de bandeau : 800, `clamp(2rem, 8.4vw, 2.6rem)`, interlettrage −0,04 em, blanc. Titres de
carte : 760, 1,22 rem. Surtitres (`.eyebrow`) : 0,72 rem, capitales, 750, indigo. Compteur d'accueil : 800, jusqu'à 4,6 rem. Corps : 16 px.

### Formes, ombres, bordures

Cartes : rayon 26 (compteur 30), aucune bordure, `--sh-1` (ombre indigo douce) + filet `--edge` à 6 %. Bandeau : rayon inférieur 34.
Barre de navigation : rayon 26, flottante à 10–12 px des bords, flou d'arrière-plan. Boutons : rayon 16, 52 px (40 px pour `.sm`).
Feuilles : rayon 32 en haut.

### Composants

| Composant | Classe | Règle |
|---|---|---|
| Bandeau de page | `.pg-head` (`data-tone`), `.pg-bar`, `.pg-title`, `.page-sub` | Toutes les pages (`topbar()`), le contenu suivant chevauche de 40 px |
| Retour | `.pg-back` | Pastille translucide, libellé de la section parente |
| Navigation | `.nav`, `.nav-help` | 4 destinations + Aide au centre (58 px, dégradé indigo, logo) ; barre latérale au-delà de 900 px |
| Onglets | `.segc`, `.ptabs` | Onglet actif plein indigo ; libellés sur deux lignes si nécessaire |
| Compteur | `.hm-hero` | Anneau en tête, chiffre centré, 3 pastilles |
| Agir maintenant | `.hm-help`, `.hm-sos`, `.hm-tools`, `.hm-hard` | Envie (dégradé), 4 gestes en tuiles, journée difficile |
| Moment à risque | `.hm-risk` | Fond ambre pâle, 2 actions, « Pourquoi je vois ça ? » |
| Triage de l'aide | `.qs-tri`, `.qs-t` (`-main`, `-danger`) | 4 besoins, 76 px de haut minimum |
| Tuiles d'exercice | `.rs-t` | Icône, nom, durée |
| Grille « Ton espace » | `.hub-g` | Colonnes adaptatives (texte agrandi) |
| Bienvenue | `.welcome4`, `.w4-*` | Plein écran, bouton blanc collant |
| Entrée des pages | `#app.pg-in` | 0,42 s, décalage 40 ms ; supprimé si moins d'animations |

Icônes et écrans de lancement : `libre-app/scripts/render-assets.js` (dégradé `#1E1A55` → `#5A43C9`, logo blanc, point `#FF9A6B`).
