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
