---
name: LIBRE
description: "Verre de mer : chaque jour tenu polit un galet de verre à la couleur de l'addiction."
colors:
  wet-sand: "#F1F0EB"
  wet-sand-deep: "#E8E7E1"
  foam-paper: "#FBFBF8"
  on-tint-white: "#FFFFFF"
  frosted-pane: "rgba(255,255,255,0.72)"
  glass-pane: "rgba(250,250,247,0.62)"
  glass-pane-strong: "rgba(250,250,247,0.8)"
  glass-edge: "rgba(255,255,255,0.85)"
  kelp-ink: "#15211F"
  kelp-ink-2: "#4A5754"
  kelp-ink-3: "#5C6865"
  hairline: "rgba(21,33,31,0.09)"
  hairline-2: "rgba(21,33,31,0.16)"
  night-sea: "#0A1315"
  night-sea-2: "#0F1B1E"
  night-paper: "#132124"
  night-glass: "rgba(22,36,39,0.58)"
  night-ink: "#E7EEEC"
  night-ink-2: "#A9B6B3"
  night-ink-3: "#93A19E"
  foam-tint: "#2F7A66"
  foam-tint-strong: "#246352"
  foam-tint-soft: "#DCEFE8"
  foam-tint-night: "#7FD0B6"
  help-coral: "#A8341F"
  help-coral-soft: "#F6E1DC"
  help-coral-night: "#FF8C76"
  ok-green: "#2E7A4F"
  warn-amber: "#9A5B00"
  danger-red: "#B3261E"
  tint-libre: "#3D6B57"
  tint-tabac: "#2E7D62"
  tint-alcool: "#B0521F"
  tint-cannabis: "#4F7A1F"
  tint-argent: "#245BB0"
  tint-ecrans: "#0F7480"
  tint-jeu: "#3D4FD6"
  tint-subst: "#3F6A85"
  tint-achats: "#8A3F7E"
  tint-intime: "#9A3F55"
typography:
  display:
    fontFamily: "ui-rounded, \"SF Pro Rounded\", -apple-system, BlinkMacSystemFont, system-ui, \"Segoe UI\", Roboto, sans-serif"
    fontSize: "68px"
    fontWeight: 600
    lineHeight: 0.95
    letterSpacing: "-0.04em"
    fontFeature: "\"tnum\""
  headline:
    fontFamily: "ui-rounded, \"SF Pro Rounded\", -apple-system, BlinkMacSystemFont, system-ui, sans-serif"
    fontSize: "34px"
    fontWeight: 700
    lineHeight: 1.12
    letterSpacing: "-0.022em"
  greeting:
    fontFamily: "ui-rounded, \"SF Pro Rounded\", -apple-system, BlinkMacSystemFont, system-ui, sans-serif"
    fontSize: "24px"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.015em"
  title:
    fontFamily: "ui-rounded, \"SF Pro Rounded\", -apple-system, BlinkMacSystemFont, system-ui, sans-serif"
    fontSize: "22px"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.012em"
  figure:
    fontFamily: "ui-rounded, \"SF Pro Rounded\", -apple-system, BlinkMacSystemFont, system-ui, sans-serif"
    fontSize: "28px"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-0.02em"
    fontFeature: "\"tnum\""
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, \"SF Pro Text\", system-ui, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.47
    letterSpacing: "-0.006em"
  label:
    fontFamily: "-apple-system, BlinkMacSystemFont, \"SF Pro Text\", system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "0em"
  caption:
    fontFamily: "-apple-system, BlinkMacSystemFont, \"SF Pro Text\", system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.45
  tab:
    fontFamily: "-apple-system, BlinkMacSystemFont, \"SF Pro Text\", system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 600
    lineHeight: 1.1
rounded:
  icon: "9px"
  control: "12px"
  row: "16px"
  group: "20px"
  sheet: "28px"
  pill: "999px"
spacing:
  s1: "4px"
  s2: "8px"
  s3: "12px"
  s4: "16px"
  s5: "20px"
  s6: "24px"
  s8: "32px"
  s10: "40px"
  s12: "48px"
  gutter: "20px"
components:
  button-primary:
    backgroundColor: "{colors.kelp-ink}"
    textColor: "{colors.wet-sand}"
    typography: "{typography.body}"
    rounded: "{rounded.pill}"
    padding: "0 22px"
    height: "50px"
  button-accent:
    backgroundColor: "{colors.foam-tint}"
    textColor: "{colors.on-tint-white}"
    rounded: "{rounded.pill}"
    padding: "0 22px"
    height: "50px"
  button-quiet:
    backgroundColor: "transparent"
    textColor: "{colors.kelp-ink}"
    rounded: "{rounded.pill}"
    padding: "0 22px"
    height: "50px"
  button-small:
    rounded: "{rounded.pill}"
    padding: "0 16px"
    height: "40px"
  help-band:
    backgroundColor: "{colors.help-coral}"
    textColor: "{colors.on-tint-white}"
    rounded: "{rounded.pill}"
    padding: "10px 16px 10px 10px"
    height: "64px"
  chip:
    backgroundColor: "{colors.frosted-pane}"
    textColor: "{colors.kelp-ink}"
    rounded: "{rounded.pill}"
    padding: "0 16px"
    height: "44px"
  chip-selected:
    backgroundColor: "{colors.foam-tint}"
    textColor: "{colors.on-tint-white}"
    rounded: "{rounded.pill}"
  input:
    backgroundColor: "{colors.foam-paper}"
    textColor: "{colors.kelp-ink}"
    rounded: "{rounded.control}"
    padding: "12px 16px"
    height: "50px"
  group:
    backgroundColor: "{colors.frosted-pane}"
    rounded: "{rounded.group}"
    padding: "{spacing.s4}"
  list-row:
    textColor: "{colors.kelp-ink}"
    padding: "10px 16px"
    height: "56px"
  tab-bar:
    backgroundColor: "{colors.glass-pane}"
    rounded: "{rounded.pill}"
    padding: "5px"
    height: "64px"
  sheet:
    backgroundColor: "{colors.glass-pane-strong}"
    rounded: "{rounded.sheet}"
    padding: "6px 20px 24px"
---

# Design System: LIBRE

## Overview

**Creative North Star: "Le verre de mer"**

Un éclat coupant devient, avec le temps et la mer, une pierre lisse, givrée et lumineuse. LIBRE 21 « Verre de mer » raconte le changement d'une habitude avec ce seul objet : un galet de verre par addiction, littéralement poli par les jours tenus. Ce monde remplace l'apparence LIBRE 19 « Verre » et l'organisation visuelle LIBRE 20 ; il n'est issu d'aucun monde de catalogue.

Le sol est du sable mouillé le jour (blanc gris chaud) et une mer de nuit en mode sombre (encre bleu-vert profonde). Le verre est le seul matériau : des volets givrés au bord supérieur clair qui flottent au-dessus du contenu, jamais empilés sur du verre. Chaque addiction possède une seule teinte de verre (sa couleur historique), utilisée pour son galet, sa ligne de progression et ses sélections, nulle part ailleurs. Un seul corail est réservé à l'Aide. Police système, chiffres tabulaires, grands numéraux calmes.

La densité est celle d'une app iOS de réglages au calme : une colonne de 640 px maximum, des groupes givrés à un seul niveau, des lignes de 56 px séparées par des filets. Le mouvement est amorti sans rebond ; rien ne boucle sauf l'exercice de respiration. LIBRE refuse explicitement la pile de cartes blanches des apps de bien-être et le tableau de bord clinique.

**Key Characteristics:**
- Un objet focal par écran : le galet et son chiffre sur l'accueil, posés sur le sable, sans carte.
- Verre réservé à la couche flottante (barre d'onglets, en-tête, fenêtres, notifications) ; le contenu repose sur des groupes givrés.
- Une teinte par addiction, injectée par JS ; un corail unique pour l'Aide.
- Police système (SF Pro Text pour le texte, SF Pro Rounded pour titres et chiffres), chiffres tabulaires.
- Mode sombre « mer de nuit » complet, et plein écran nocturne pour l'aide guidée quel que soit le thème.
- Transparence et mouvement réductibles (préférences système et mode « Affichage sobre »).

## Colors

Des neutres de sable teintés vers l'écume, une encre algue, une teinte de verre variable par addiction et un corail d'alerte unique.

### Primary
- **Teinte de l'addiction** (`--accent`, par défaut Écume `foam-tint`) : couleur du galet, de la barre de progression, du bouton « + », des puces sélectionnées, du jour réussi dans la semaine et le calendrier, des lignes de graphiques. Elle est remplacée à l'exécution par `applyHabitTheme()` à partir de la table `HPAL` : `--accent` (teinte), `--accent-strong` (texte et contours, version foncée), `--accent-soft` (fond des pastilles d'icône), `--accent-ink` (texte posé sur la teinte). En mode sombre, la variante claire de chaque famille prend le relais (`foam-tint-night` pour l'écume).
- **Familles de teintes** (`tint-libre`, `tint-tabac`, `tint-alcool`, `tint-cannabis`, `tint-argent`, `tint-ecrans`, `tint-jeu`, `tint-subst`, `tint-achats`, `tint-intime`) : Bleu nuit et sauge, Vert sauge, Ambre, Vert naturel, Bleu profond, Turquoise, Bleu électrique, Ardoise, Prune, Rose brique. Chacune a sa variante forte, douce et nocturne dans `HPAL` (voir le fichier annexe pour les rampes).

### Secondary
- **Corail d'aide** (`help-coral`, nuit `help-coral-night`) : l'onglet Aide au centre de la barre, le bandeau « J'ai une envie » de l'accueil, la première action d'une situation d'envie, les numéros d'urgence, les compteurs de notification. `help-coral-soft` sert de fond aux actions destructrices et aux messages d'erreur.

### Neutral
- **Sable mouillé** (`wet-sand`, `wet-sand-deep`) : fond de l'app le jour.
- **Blanc sur teinte** (`on-tint-white`) : texte posé sur la teinte claire ou sur le corail (`--accent-ink`, `--help-ink` le jour).
- **Papier d'écume** (`foam-paper`) : surface opaque des champs, de la goutte du sélecteur segmenté, et de toutes les surfaces quand la transparence est réduite.
- **Volet givré** (`frosted-pane`) : fond des groupes de contenu.
- **Verre** (`glass-pane`, `glass-pane-strong`, `glass-edge`) : couche flottante ; le bord `glass-edge` dessine la tranche lumineuse en haut de chaque volet.
- **Encre algue** (`kelp-ink`, `kelp-ink-2`, `kelp-ink-3`) : texte principal, secondaire et tertiaire.
- **Filets** (`hairline`, `hairline-2`) : contours de 0,5 px et séparateurs de lignes.
- **Mer de nuit** (`night-sea`, `night-sea-2`, `night-paper`, `night-glass`, `night-ink`…) : mêmes rôles en mode sombre, et fond fixe des écrans plein écran (aide guidée, respiration, verrou, récits).
- **États** (`ok-green`, `warn-amber`, `danger-red`) : réussite et interrupteurs actifs, dépassement, suppression.

### Named Rules
**La règle d'une teinte par addiction.** La couleur d'une addiction apparaît sur son galet, sa progression et ses sélections, et nulle part ailleurs : surfaces, typographie, icônes de navigation et logo restent ceux de LIBRE.

**La règle du corail unique.** Le corail appartient à l'Aide. Aucun autre élément, ni décor ni accent, ne le porte.

**La règle de la lumière unique.** La seule lumière d'ambiance est un voile de la teinte de l'addiction (9 % mêlé au sable) sur les 60 % supérieurs de la page, comme vu à travers un verre ; aucun autre dégradé de fond.

## Typography

**Display Font:** SF Pro Rounded (`ui-rounded`, repli `-apple-system`, `system-ui`, Roboto)
**Body Font:** SF Pro Text (`-apple-system`, repli `system-ui`, Segoe UI, Roboto, Helvetica Neue, Arial)

**Character:** La police système, sans fonte chargée : la version arrondie porte les chiffres et les titres avec douceur, la version texte porte la lecture. Les chiffres sont toujours tabulaires.

### Hierarchy
- **Display** (600, 68 px, interligne 0,95, -0,04em, tabulaire) : le nombre de jours ou la moyenne hebdomadaire à côté du galet ; 52 px sous 360 px de large.
- **Headline** (700, 34 px, 1,12) : grand titre des pages ; 30 px sous 360 px. Le titre de bienvenue monte à 44 px, les titres du questionnaire et de l'aide guidée à 30 px.
- **Greeting** (600, 24 px, 1,2) : la salutation de l'accueil, volontairement discrète pour laisser le galet et le chiffre former la paire focale.
- **Title** (600, 22 px, 1,25) : titres de sections ; 20 px dans les groupes et fenêtres.
- **Figure** (600, 28 px, 1,1, tabulaire) : chiffres clés du suivi ; 17 à 24 px dans les tuiles et faits.
- **Body** (400, 17 px, 1,47) : texte courant, lignes de liste (500 pour l'intitulé), champs.
- **Label** (600, 15 px, 1,3) : libellés de champs et de chiffres, en couleur `kelp-ink-2`, casse normale.
- **Caption** (400, 13 px, 1,45) : notes de calcul, sources, métadonnées, en `kelp-ink-3`.
- **Tab** (600, 11 px) : libellés de la barre d'onglets.

### Named Rules
**La règle des chiffres calmes.** Tout nombre affiché porte `font-variant-numeric: tabular-nums` et la police arrondie ; un chiffre ne clignote, ne compte ni ne pulse jamais.

**La règle sans sur-titre.** La hiérarchie se lit dans le titre lui-même : pas de sur-titre décoratif, pas de capitales espacées. Seul le logotype LIBRE porte un espacement large (0,16em).

## Layout

Une colonne unique centrée de 640 px maximum avec une gouttière de 20 px (16 px sous 360 px), sur une grille de 4 pt (`s1` à `s12`). Les blocs d'une page sont espacés de 16 px ; l'accueil respire davantage (32 px entre sections). Le bas de page réserve la hauteur de la barre d'onglets (64 px) plus 40 px et la zone de sécurité.

Premier écran de l'accueil : date et salutation en petit, puis le galet (environ 42 % de la largeur, au moins 128 px ; 96 px sous 360 px) en grille à deux colonnes avec le chiffre principal et la prochaine étape, puis une seule ligne d'action (noter / envie).

À partir de 1024 px, la barre d'onglets devient une barre latérale de verre de 280 px (repliable à 96 px, icônes seules) et le contenu s'élargit jusqu'à 1120 px (1200 px dès 1360 px). Les fenêtres passent du bas de l'écran au centre dès 700 px. Les grilles de raccourcis passent de 2 à 1 colonne sous 440 px et de 2 à 3 colonnes au-delà de 700 px.

## Elevation & Depth

Profondeur hybride : la couche flottante est en verre (flou et saturation de l'arrière-plan, tranche claire en haut, filet de 0,5 px, ombre portée diffuse) ; le contenu repose sur des groupes givrés à un seul niveau avec une ombre très légère. Un groupe imbriqué dans un groupe perd son ombre et passe au fond `--surface-2` : il n'y a jamais de carte dans une carte.

### Shadow Vocabulary
- **Repos** (`box-shadow: 0 1px 2px rgba(21,33,31,.05), 0 6px 18px -10px rgba(21,33,31,.14)`) : groupes de contenu.
- **Flottant** (`box-shadow: 0 2px 6px rgba(21,33,31,.06), 0 18px 40px -18px rgba(21,33,31,.28)`) : barre d'onglets, fenêtres, notifications, boutons ronds de l'en-tête.
- **Tranche de verre** (`box-shadow: inset 0 1px 0 var(--glass-edge), inset 0 0 0 .5px var(--line)`) : bord lumineux ajouté à chaque volet, flottant ou givré.

### Named Rules
**La règle du verre qui flotte.** Le flou (`saturate(170%) blur(24px)`) est réservé à ce qui flotte au-dessus du contenu. Jamais de verre posé sur du verre.

**La règle de la transparence réductible.** Avec `prefers-reduced-transparency` ou l'« Affichage sobre », tout verre devient `foam-paper` opaque et le flou disparaît ; la hiérarchie doit rester lisible sans lui.

## Shapes

Des formes douces et continues : capsules (999 px) pour toutes les commandes tactiles (boutons, puces, sélecteurs, barre d'onglets, bandeau d'aide), coins de 20 px pour les groupes, 16 px pour les lignes cliquables isolées, 12 px pour les champs, 9 px pour les pastilles d'icône de 32 px, 28 px pour le haut des fenêtres. Les contours sont des filets de 0,5 px, jamais des bordures épaisses. La seule forme irrégulière du système est le galet : un éclat à sept côtés dont les angles s'arrondissent avec la progression.

## Components

### Buttons
Tactiles et posés : une capsule pleine pour l'action forte, une capsule vide pour le reste.
- **Shape:** capsule (999 px), hauteur 50 px (40 px en petit), marge interne 0 22 px.
- **Primary:** fond `kelp-ink`, texte sable (inversé en mode sombre et en plein écran nocturne). Une seule par écran.
- **Accent:** fond de la teinte de l'addiction, texte `--accent-ink`.
- **Quiet / Ghost:** fond transparent, contour de 1 px `hairline-2`.
- **Danger:** fond `help-coral-soft`, texte `danger-red`.
- **Pression:** échelle 0,97 en 0,14 s (`cubic-bezier(.22,1,.36,1)`) ; avec mouvement réduit, opacité 0,75 au lieu de l'échelle. Focus : contour de 2 px `--accent-strong` décalé de 3 px.

### Chips
- **Style:** capsule de 44 px, fond givré, filet `hairline-2`, texte 500 16 px.
- **State:** sélectionnée (`aria-pressed="true"`) en teinte pleine avec `--accent-ink`, sans filet.

### Segmented control
Fond `--surface-2` en capsule, segments de 34 px ; le segment actif est marqué par une goutte opaque `foam-paper` à ombre douce qui glisse (transform et largeur, 0,22 s).

### Cards / Containers
- **Corner Style:** 20 px.
- **Background:** `frosted-pane` ; imbriqué : `--surface-2` sans ombre.
- **Shadow Strategy:** tranche de verre + ombre de repos (voir Elevation & Depth).
- **Border:** filet de 0,5 px `hairline`.
- **Internal Padding:** 16 px ; enfants espacés de 12 px.

### Lists
Lignes style réglages de 56 px minimum, pastille d'icône de 32 px en teinte douce, intitulé 500 17 px, sous-ligne 14 px `kelp-ink-2`, chevron 16 px `kelp-ink-3`, séparateur de 0,5 px décalé de 60 px à gauche.

### Inputs / Fields
- **Style:** fond `foam-paper`, hauteur 50 px, coins 12 px, contour intérieur de 1 px `hairline-2`, texte 17 px.
- **Focus:** contour intérieur de 2 px `--accent-strong`, curseur à la teinte.
- **Error:** encart `help-coral-soft` à texte `danger-red`, coins 12 px. Interrupteurs iOS 51 × 31 px, vert `ok-green` quand actifs.

### Navigation
Barre d'onglets en verre, capsule de 64 px à 12 px des bords, cinq onglets : Aujourd'hui, Progrès, Aide (au centre), Mon plan, Profil. Icônes 24 px, libellés 11 px en `kelp-ink-2` ; l'onglet courant passe en `--accent-strong` et un indicateur de verre teinté (14 % de la teinte) glisse derrière lui en 0,42 s avec un léger étirement. L'Aide est un disque corail de 34 px, la seule couleur chaude de la barre. Sur ordinateur, barre latérale de verre avec la marque, la recherche, les suivis (petits galets) et un bouton Aide corail en capsule.

### Sheets
Fenêtres qui montent du bas : verre fort, coins de 28 px en haut, poignée de 36 × 5 px, voile `rgba(5,12,13,.38)`. Entrée unique par matérialisation (translation de 40 px, échelle 0,98 et flou qui se dissipe, 0,38 s).

### Help band
Le bandeau « J'ai une envie » de l'accueil : capsule corail de 64 px, pastille d'icône de 44 px à 18 % de blanc, titre 600 17 px et sous-ligne 14 px. C'est l'action forte de l'accueil.

### Le galet (composant signature)
Un SVG de verre en `currentColor` (la teinte de l'addiction, variante nocturne en mode sombre), généré par `pebbleSVG(h, polish)` à partir d'une graine propre à chaque suivi. Le poli (`polishOf`) va de 0,06 à 1 : en abstinence, logarithme des jours tenus sur une année ; en réduction ou compréhension, part des jours réussis de la semaine. Plus le poli monte, plus les angles s'arrondissent, plus la surface se givre moins et plus la lumière intérieure et la tranche claire grandissent. Il apparaît en grand sur l'accueil (entrée par un simple « pop » de 0,6 s), à 48 px dans la liste des suivis et à 18 px dans le sélecteur de suivi et la barre latérale. Le bienvenue l'utilise comme visuel principal.

### Étapes (médailles)
Disques de verre teinté de 44 à 52 px : contour de la teinte à 45 % pour une étape franchie, fond plein de la teinte pour la plus haute ; étape à venir en `--surface-2` avec filet. Pas d'imitation de métal.

### Plein écran nocturne
Aide guidée, respiration, verrou et récits utilisent toujours la mer de nuit (`night-sea`) avec un voile de teinte à 16 %, même en thème clair. La sphère de respiration est la seule animation en boucle du système.

## Do's and Don'ts

### Do:
- **Do** garder un seul objet focal et une seule action forte par écran (le galet et la ligne « noter / envie » sur l'accueil).
- **Do** prendre la teinte d'une addiction uniquement dans `--accent`, `--accent-strong`, `--accent-soft`, `--accent-ink` (injectées par `applyHabitTheme`), jamais en valeur codée.
- **Do** réserver le corail (`--help`) à l'Aide et aux urgences.
- **Do** poser le verre (`--glass`, flou 24 px, tranche `--glass-edge`) uniquement sur la couche flottante ; le contenu va dans des groupes givrés de 20 px.
- **Do** donner aux commandes principales 44 à 50 px de haut (boutons, puces, lignes de 56 px) ; aucune cible sous 24 px, contrôlée par `npm run -s check:targets`.
- **Do** écrire chaque nombre en police arrondie et chiffres tabulaires.
- **Do** utiliser la courbe `cubic-bezier(.22,1,.36,1)` (0,14 / 0,22 / 0,36 s) pour toute transition, et couper toute animation sous `prefers-reduced-motion` et en « Affichage sobre ».
- **Do** vérifier chaque surface en sable mouillé et en mer de nuit, et sans transparence.

### Don't:
- **Don't** empiler des cartes blanches ni imbriquer une carte ombrée dans une autre.
- **Don't** poser du verre sur du verre.
- **Don't** ajouter de dégradé de fond autre que le voile de teinte unique en haut de page.
- **Don't** utiliser la teinte d'une addiction sur les surfaces, la typographie courante, le logo ou les icônes de navigation au repos.
- **Don't** faire boucler, pulser ou rebondir une animation ; seule la respiration boucle.
- **Don't** ajouter de sur-titres décoratifs ni de libellés en capitales espacées.
- **Don't** imiter le métal, le bois ou toute autre matière que le verre.
