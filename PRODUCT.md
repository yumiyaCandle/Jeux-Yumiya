# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

(Application web en un seul fichier `libre/index.html`, installable comme PWA, et embarquée telle quelle dans les projets natifs Capacitor iOS et Android de `libre-app/`. Le langage visuel est celui du web mobile, l’iPhone est la cible prioritaire.)

## Users

Adultes qui veulent arrêter, réduire, mieux contrôler ou simplement comprendre une consommation ou une habitude : tabac, vape, alcool, cannabis, autres substances, jeux d’argent, écrans, réseaux sociaux, achats, etc. Ils ouvrent LIBRE seuls, souvent sur leur téléphone, à deux moments très différents :
- au calme, pour noter, suivre et préparer ;
- pendant une envie, un moment de stress ou juste après une rechute, où chaque seconde et chaque mot comptent.

Public international (confirmé par la personne propriétaire) : aucun pays n’est imposé, le pays d’aide découle de la langue et des réglages ; les ressources suisses restent une option parmi d’autres.

## Product Purpose

Accompagner le changement d’une habitude sans juger : aide immédiate face à une envie, suivi honnête des progrès (y compris en réduction, sans compteur d’abstinence imposé), compréhension de ce qui se passe, préparation des moments à risque. Le succès : la personne revient d’elle-même, traverse plus d’envies et ne se sent jamais coupable en ouvrant l’app.

## Positioning

Une seule app pour toutes les addictions, chacune avec sa couleur ; fonctionne sans compte et sans réseau ; données locales chiffrables ; compte facultatif avec synchronisation chiffrée de bout en bout ; aucune publicité ; ton bienveillant ; jamais présentée comme un soin médical.

## Operating Context

Utilisation d’une main, souvent la nuit ou en situation de stress ; besoin de discrétion (mode discret, verrouillage) ; usage hors ligne ; rappels locaux ; export PDF d’un bilan à montrer à un médecin.

## Capabilities and Constraints

- Code : `libre/index.html` (un seul fichier, HTML + CSS + JS sans framework) ; version autonome produite par `python3 tools/build-standalone.py`.
- Fonctions existantes à préserver (aucune suppression sans meilleure solution) : inscription/compte facultatif (e-mail ou téléphone, codes, clé de récupération), onboarding, suivi multi-addictions, consommation, envies, journal, humeur, aide guidée, respiration, plans « si… alors… », raisons, proches, déclencheurs, statistiques, calendrier, économies, étapes/médailles, bilans PDF, bibliothèque et fiches sourcées, notifications locales, sauvegardes chiffrées, mode discret, verrouillage, 6 langues de lancement.
- Compatibilité des anciennes sauvegardes obligatoire.
- Toute fonction qui demande Internet doit être signalée et validée.
- `BIO_ENABLED=false`.

## Brand Commitments

- Nom : LIBRE ; signature « Chaque jour, un pas vers ta liberté ».
- Couleur propre à chaque addiction (thème dynamique) : confirmée, à conserver.
- Verre liquide dosé « comme chez Apple », sur toute l’app : confirmé, à conserver.
- Tutoiement, ton calme et sans culpabilité.

## Evidence on Hand

Fiches et sources réelles dans le code (`COMP`, `SRC`, `LEARN_BASE`, `LEARN_FAQ`, `LEARN_RES`). Aucun éditeur, adresse, numéro, validation médicale ni certification à inventer. Aucun témoignage ni chiffre d’usage disponible.

## Product Principles

1. L’aide d’abord : depuis n’importe quel écran, l’aide est à un geste.
2. Jamais culpabiliser : une rechute est une information, pas un échec.
3. Le vrai, pas le gadget : pas de points artificiels, pas de fonction factice, sources citées.
4. La vie privée par défaut : local, hors ligne, discret.
5. Ne jamais remplacer un professionnel ni les urgences.

## Accessibility & Inclusion

Contraste AA minimum (contrôlé par `npm run -s check:contrast`), cibles tactiles ≥ 24 px (`check:targets`), réduction des animations et de la transparence respectées, texte agrandi jusqu’à 200 %, écriture inclusive (« seul·e »), 6 langues de lancement sans texte manquant.
