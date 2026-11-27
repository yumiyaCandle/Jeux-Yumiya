# LIBRE 19 « Verre » — verre liquide sur toute l'application

Demande de la personne propriétaire, après les trois directions LIBRE 18 : « plus professionnel, en gardant les couleurs par addiction, et le Liquid Glass comme chez Apple sur toute l'application ».

Il s'agit d'une couche visuelle finale ajoutée à `libre/index.html`. Elle se pose par-dessus LIBRE 18 « Aube » et ne change ni les fonctions, ni les données, ni les sauvegardes.

## Principes (apple-design §12, matières et profondeur)

- **Fond** : la couleur de l'addiction affichée (`--hp1`, `--hp3`, `--hp6`, `--hp4`) diffusée en grandes zones de lumière, fixée sous le contenu pour que le verre ait quelque chose à réfracter. Changer d'addiction change la couleur de toute l'app : vert sauge pour le tabac, ambre pour l'alcool, etc.
- **Une seule recette de verre** : fond translucide, flou et saturation, arête claire en haut, filet fin et ombre douce. Elle existe en trois épaisseurs (`--v-glass`, `--v-glass-2`, `--v-blur-thick`), et les grandes surfaces sont plus épaisses. On ne superpose jamais un verre clair flouté sur un autre : à l'intérieur d'un panneau, les éléments sont en verre plein, sans flou.
- **Verre teinté par l'addiction** : le compteur, le Jour J et la question du journal.
- **Verre rouge** : l'aide (« J'ai une envie », l'onglet Aide, « Je suis en danger »).
- **Boutons** :
  - principal : couleur de l'addiction avec un reflet ;
  - secondaire : verre ;
  - danger : rouge.
- **Barre d'onglets** : une capsule de verre flottante, détachée du bord ; l'onglet actif est une goutte plus claire. Sur ordinateur, la barre latérale est en verre.
- **Aide et exercices d'urgence** :
  - fond profond teinté par l'addiction, rangées en verre ;
  - pour la respiration, une bulle de verre clair qui grandit et se rétracte.
- **Écran de départ, questionnaire et comptes** : verre liquide sur fond de nuit (voir LIBRE 18).

## Accessibilité

- « Réduire la transparence » rend toutes les surfaces opaques.
- « Contraste renforcé » épaissit les filets.
- Vérifié : aucun texte sous AA en clair ou en sombre (`npm run -s check:contrast`), zones tactiles ≥ 24 px (`npm run -s check:targets`).
