# LIBRE — consignes permanentes

À relire au début de chaque session sur ce dépôt.

## Le brief de référence

**Le brief de design de référence est [docs/BRIEF-REFONTE-LIBRE.md](docs/BRIEF-REFONTE-LIBRE.md).** La personne propriétaire du projet a demandé de ne jamais l'oublier. Toute évolution visuelle de LIBRE doit le respecter :
- une identité originale et premium (pas une copie d'Apple) ;
- pas de cartes blanches empilées ni de dégradés artificiels ; le verre liquide est voulu, mais dosé comme chez Apple ;
- une seule action forte par écran ;
- l'Aide (SOS) particulièrement soignée ;
- des animations qui ont une raison d'être.

Outils à utiliser réellement : `/find-skills`, `/apple-design`, `/unslop`, `/21st:21st-ui` ; installés pour LIBRE 21 : `impeccable`, `accessibility`, `performance`, `webapp-testing`.

Interface et organisation actuelles : **LIBRE 21 « Verre de mer »**, décrite dans [docs/LIBRE-21.md](docs/LIBRE-21.md). Système de design : [DESIGN.md](DESIGN.md) ; fiche produit : [PRODUCT.md](PRODUCT.md) ; contrat de direction : `.impeccable/surfaces/libre-index-html.md`. Onglets : Aujourd’hui, Progrès, Aide (au centre), Mon plan (avec Comprendre), Profil. Le galet de verre (`pebbleSVG`) est la signature : il ne doit pas devenir décoratif ailleurs.

Feuille de style : **une seule**, en tête de `libre/index.html`, organisée par sections (jetons → base → verre → typographie → groupes → commandes → navigation → fenêtres → écrans → mouvement). Modifier la règle existante plutôt qu’ajouter une couche qui surcharge ; pas de `!important` sauf nécessité réelle.

Historique : LIBRE 20 (5 onglets, [docs/LIBRE-20.md](docs/LIBRE-20.md)), LIBRE 19 « Verre » ([docs/LIBRE-19.md](docs/LIBRE-19.md)), LIBRE 18 « Aube » ([docs/LIBRE-18.md](docs/LIBRE-18.md)). Copie autonome de LIBRE 20 : `livraison/archive/LIBRE-20-avant-refonte.html`.

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
