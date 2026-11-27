# LIBRE — consignes permanentes

À relire au début de chaque session sur ce dépôt.

## Le brief de référence

**Le brief de design de référence est [docs/BRIEF-REFONTE-LIBRE.md](docs/BRIEF-REFONTE-LIBRE.md).** La personne propriétaire du projet a demandé de ne jamais l'oublier. Toute évolution visuelle de LIBRE doit le respecter :
- une identité originale et premium (pas une copie d'Apple) ;
- pas de cartes blanches empilées ni de dégradés artificiels ; le verre liquide est voulu, mais dosé comme chez Apple ;
- une seule action forte par écran ;
- l'Aide (SOS) particulièrement soignée ;
- des animations qui ont une raison d'être.

Outils à utiliser réellement : `/find-skills`, `/apple-design`, `/unslop`, `/21st:21st-ui`.

Interface actuelle : **LIBRE 19 « Verre »**, décrite dans [docs/LIBRE-19.md](docs/LIBRE-19.md). Elle applique le verre liquide sur toute l'app et garde les couleurs par addiction, à la demande de la personne propriétaire. Elle se pose sur LIBRE 18 « Aube » ([docs/LIBRE-18.md](docs/LIBRE-18.md)).

Organisation actuelle : **LIBRE 20**, avec 5 onglets (Accueil, M’aider, Mon suivi, Comprendre, Profil), décrite dans [docs/LIBRE-20.md](docs/LIBRE-20.md). Le brief de reconstruction fonctionnelle est résumé dans ce document.

Préférences exprimées après le brief :
- un rendu professionnel ;
- la couleur de chaque addiction conservée ;
- le Liquid Glass comme chez Apple, partout.

## Règles du projet

- **Code** :
  - application = `libre/index.html` (un seul fichier) ;
  - version autonome = `python3 tools/build-standalone.py`, qui produit `libre/LIBRE.html`.
- **Fonctions et données** :
  - ne supprimer aucune fonctionnalité ;
  - préserver les données et la compatibilité avec les anciennes sauvegardes ;
  - ne pas créer de fonctions qui semblent marcher mais ne font rien.
- **Internet** : toute nouvelle fonctionnalité qui en a besoin doit être signalée et validée avant d'être intégrée.
- **Langues** : six langues de lancement (fr, en, de, it, es, pt). `python3 tools/i18n.py audit` doit indiquer 0 texte manquant pour chacune.
- **Tests** :
  - `node tests/run.js`, `npm run -s check:contrast`, `npm run -s check:targets` ;
  - ne jamais déclarer un test réussi s'il n'a pas été lancé.
- **Santé et sécurité** :
  - ne jamais prétendre diagnostiquer ni prédire ;
  - ne jamais laisser entendre que LIBRE remplace les urgences ;
  - `BIO_ENABLED=false`.
- **Informations à ne jamais inventer** : éditeur, adresse, numéros, validation médicale, certifications.
- Communiquer en français.
