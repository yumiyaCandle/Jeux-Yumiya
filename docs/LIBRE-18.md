# LIBRE 18 « Aube » — refonte visuelle complète

LIBRE 18 remplace la couche visuelle 17 « Natif ». Elle ne change ni les données ni la logique : toutes les fonctions, tous les écrans et les anciennes sauvegardes restent compatibles. Le style optionnel « Verre » (`html.fx`) n’est pas touché.

## Direction

| | |
|---|---|
| Produit | LIBRE aide une personne à arrêter ou réduire une addiction, un jour après l’autre |
| Caractère | calme, posé, fier sans bruit |
| Monde | l’heure qui précède l’aube : encre de nuit, papier chaud, première lumière |
| Moments forts | le compteur (scène de nuit, horizon), l’Aide et ses exercices (plein écran de nuit), la courbe des progrès |
| Signature | la ligne d’horizon et son soleil, qui montent vers la prochaine étape |

Outils utilisés pour la concevoir :
- `/unslop`, pour la direction, les jetons, la chasse aux signes « IA » et le contrôle des contrastes ;
- `/apple-design`, pour la police du système, la hiérarchie par la taille, le retour au toucher immédiat, les transitions courtes et le respect de « réduire les animations » ;
- `/find-skills` : le catalogue skills.sh n’est pas joignable depuis l’environnement. La liste ComposioHQ/awesome-claude-skills a été consultée et les règles anti-« AI slop » de `swiftui-design-skill` ont été lues, sans rien installer ;
- `/21st:21st-ui` (`get_inspiration`), pour des références de widgets santé, de compteurs et de listes d’habitudes.

Les pages apple.com n’ont pas pu être lues depuis l’environnement, dont le réseau bloque ce site. Les principes appliqués sont ceux du skill apple-design, et non une analyse directe des pages :
- de grands chiffres avec des légendes courtes ;
- des sections qui respirent ;
- une seule action forte par écran.

## Couleur : chaque teinte a un sens

| Jeton | Rôle |
|---|---|
| `--bg` papier `#F5F3EE` / nuit `#0B0D12` | fond de l’app |
| `--ink`, `--a-ink2`, `--muted` | trois rôles de texte |
| `--a-night` | scènes : compteur, Jour J, question du journal, Aide, exercices d’urgence |
| `--a-dawn` `#F2B35E` | progression : horizon, soleil, jalons, onglet actif |
| `--a-sos` `#C2412A` | aide urgente uniquement (texte blanc, contraste ≥ 4,5) |
| couleur de l’addiction (`--hp1`, `--accent`) | le suivi lui-même : teinte de la scène, jours réussis, courbe |

## Composants

- **Boutons** : trois rôles seulement.
  - Principal : encre pleine, inversée en sombre.
  - Secondaire : papier levé.
  - Aide : corail.
- **Listes** : rangées groupées (Mon plan, Progrès, Profil), pictogrammes à l’encre dans un cercle neutre, filets décalés.
- **Chiffres** : `tabular-nums`. Le compteur va de 84 à 112 px ; les chiffres clés font 30 à 34 px et sont séparés par des filets, sans cartes.
- **Accueil** :
  1. une scène de nuit, avec le compteur, l’horizon (`hzArc()`) et la saisie du jour ;
  2. la semaine, en capsules ;
  3. la journée ;
  4. un seul gros bouton « J’ai une envie ».
- **Aide et exercices** : toujours de nuit, quel que soit le thème. La respiration suit un soleil d’aube qui grandit et se rétracte.

## Mouvement

- **Toucher** : léger enfoncement à l’appui (`scale(.97)`, 80 ms).
- **Pages** : transitions de 220 à 320 ms dans le sens de la navigation (View Transitions) ; l’accueil et l’Aide apparaissent en cascade (50 ms par bloc).
- **Compteur** : il compte jusqu’à sa valeur à la première ouverture, puis anime chaque changement (`tweenDays()`).
- **Horizon** : il se dessine, puis le soleil apparaît.
- Avec « réduire les animations », tout est statique.

## Vérifications

- `npm run -s check:contrast` : aucun texte sous AA, en clair et en sombre.
- `npm run -s check:targets` : toutes les zones tactiles font au moins 24 × 24 px.
- `node tests/run.js` : suite complète.
