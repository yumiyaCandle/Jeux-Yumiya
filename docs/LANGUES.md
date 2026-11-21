# Langues de LIBRE

## Décision de lancement (version 3)

LIBRE est proposée en **6 langues** : français, anglais, allemand, italien, espagnol, portugais (avec ses variantes Brésil et Portugal).

- **Français et anglais** : tout est traduit, y compris la bibliothèque et la frise « Mon corps ».
- **Allemand, italien, espagnol, portugais** : toute l'interface est traduite (0 texte manquant, contrôlé par `python3 tools/i18n.py audit`),
  y compris les messages de sécurité, les erreurs, les rappels et les fiches de santé par addiction. Les articles longs de la bibliothèque
  et la frise « Mon corps » restent en anglais ; l'app le dit à l'utilisateur (« L'interface est entièrement traduite. Les articles…
  s'affichent en anglais pour le moment »). Ces contenus sont médicaux : ils ne doivent pas être traduits sans relecture professionnelle.

Les 14 autres langues (arabe, danois, hindi, indonésien, japonais, coréen, norvégien, néerlandais, polonais, russe, suédois, turc,
vietnamien, chinois simplifié) ont environ 845 textes chacune encore en anglais. Elles **ne sont plus proposées** dans l'app, pour ne pas
afficher une interface qui mélange deux langues. **Rien n'a été supprimé** : leurs traductions partielles restent dans le code.
Une personne dont l'appareil ou l'ancien réglage est dans l'une de ces langues voit LIBRE en anglais.

## Rouvrir une langue

1. Faire traduire le fichier `i18n/a-traduire/<langue>.csv` (colonnes : n°, texte français source, référence anglaise,
   traduction à remplir, remarque) par une personne de langue maternelle, puis le faire relire par une seconde personne.
   Les `{nom}` entre accolades sont des variables : ne pas les traduire. Certaines lignes sont des pluriels au format JSON
   (`{"one": …, "other": …}`) : traduire chaque forme.
2. Intégrer les traductions dans `libre/index.html` (objet `EXTRA`), puis vérifier : `python3 tools/i18n.py audit`.
3. Ajouter le code de la langue à `LAUNCH_LANGS` dans `libre/index.html` (ou passer `LANGS_ALL_ON` à `true` pour toutes).
4. Arabe : l'interface passe en droite-à-gauche (`dir="rtl"`) ; des règles CSS existent déjà pour les icônes et les listes.
   À relire écran par écran avec une personne arabophone, et sur iPhone et Android.
5. Lancer `npm test`, regénérer les captures des stores si la langue y figure.

## Format des nombres, dates et devises

Toujours via `Intl` selon la langue et la région de l'appareil (test « Formats régionaux »).
