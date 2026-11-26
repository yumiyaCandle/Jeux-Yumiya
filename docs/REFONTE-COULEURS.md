# LIBRE : le style « Envol » et une couleur par addiction

26 novembre 2026. À ta demande (« dans ce thème-là »), LIBRE reprend le style **Envol** :
- bandeaux d'en-tête en dégradé ;
- compteur sur carte foncée ;
- barre de navigation flottante avec le bouton **Aide** au centre ;
- titres très gras en Inter.

Chaque addiction y apporte sa propre couleur. Toutes les fonctions ajoutées depuis Envol sont conservées : centre de Soutien, fiches par situation interactives, Mon kit, « Ce qui t'aide », Parcours, journal guidé, lecture expliquée des données.

Illustrations : `docs/ux/couleurs/`. **Implémenté et testé automatiquement dans Chromium. Aucun essai sur téléphone réel ; l'app iOS n'a
jamais été compilée (pas de Mac).**

## 1. Les palettes

Chaque palette est une famille complète, pas une seule couleur :

| Élément | Rôle |
|---|---|
| Couleur d'action | Boutons, onglets actifs, liens, barres |
| Nuance de texte | Texte coloré, AA sur blanc et sur le fond |
| Nuance douce | Puces, onglet actif de la barre, fonds d'aide |
| Dégradé à trois tons | Bandeaux, compteur, « J'ai une envie », bouton Aide, aide immédiate |
| Variantes sombres | Les mêmes rôles en mode sombre |

| Famille | Addictions | Couleur | Action |
|---|---|---|---|
| Indigo LIBRE | Couleur commune ; « Autre » | indigo | `#4B3FD8` |
| Vert sauge | Cigarettes, puff, vape, chicha | vert sauge | `#2E7D62` |
| Ambre | Alcool | ambre / terracotta | `#B0521F` |
| Vert naturel | Cannabis | vert feuille | `#4F7A1F` |
| Bleu profond | Jeux d'argent | bleu profond | `#245BB0` |
| Turquoise | Réseaux sociaux, internet | turquoise | `#0F7480` |
| Bleu électrique | Jeux vidéo | indigo électrique adouci | `#3D4FD6` |
| Ardoise | Cocaïne, opioïdes, MDMA, amphétamines, méthamphétamine, hallucinogènes, médicaments | bleu-gris | `#3F6A85` |
| Prune | Achats compulsifs | prune | `#8A3F7E` |
| Rose brique | Pornographie | rose brique | `#9A3F55` |

**Contrastes vérifiés par un test automatique** pour chaque palette, en clair et en sombre :
- texte blanc sur le bouton et sur les trois tons du dégradé ;
- texte coloré sur blanc, sur le fond et sur la nuance douce ;
- mode sombre : texte foncé sur le bouton, texte coloré sur les cartes et sur la nuance douce.

Tous sont ≥ 4,5:1.

## 2. Ce qui change avec l'addiction, ce qui reste commun

| Prend la couleur du suivi | Reste commun à LIBRE |
|---|---|
| Bandeaux d'en-tête de toutes les pages | Logo, nom « LIBRE », typographie Inter |
| Compteur (carte foncée), anneau, barres de progression | Structure des pages, navigation, icônes |
| Boutons, liens, onglets actifs, onglet actif de la barre | Fonds clairs, cartes blanches, filets |
| « J'ai une envie », bouton Aide, aide immédiate plein écran | Rouge réservé au danger, vert des réussites |
| Puces, nuances douces (moment à risque, fiches, kit) | Couleurs d'humeur, crédits, textes |
| Graphiques et statistiques du suivi | Couleur de la barre d'état (suit le bandeau) |

## 3. Quel suivi donne sa couleur

| Écran | Couleur |
|---|---|
| Aujourd'hui | Le suivi sélectionné dans le bandeau (choix **mémorisé** : il revient à la réouverture) |
| Soutien, Journal, Profil, Bibliothèque, Plan… | Le dernier suivi sélectionné |
| Parcours, filtré sur un suivi | Celui-ci |
| Parcours « Tout », Mes suivis, Calendrier, Bilans avec plusieurs suivis | **Indigo LIBRE** (vue commune) : chaque suivi y est repéré par sa **pastille de couleur et son nom**, et sa carte porte un liseré de sa couleur |
| Un seul suivi | Toujours sa couleur |

Le changement est fluide : fondu de 0,45 s sur les fonds et les couleurs, sans aucun mouvement si l'appareil demande moins d'animations.
**L'information n'est jamais portée par la couleur seule** : chaque suivi est toujours nommé.

## 4. Personnalisation

Profil › Apparence › **Couleur de chaque addiction** :
- un interrupteur « Adapter les couleurs à l'addiction » (désactivé : indigo LIBRE partout) ;
- pour chaque suivi, un choix parmi les 10 palettes (uniquement des palettes vérifiées, pour garder la cohérence et les contrastes) ;
- « Revenir aux couleurs par défaut ».

Tout est mémorisé dans les préférences (`prefs.habitTheme`, `prefs.hcol`, `prefs.activeHabit`), conservé après fermeture, inclus dans
les sauvegardes. Les anciens réglages « Couleur d'accent » et « Carte principale » ne s'affichent plus qu'avec l'option « verre »,
la seule où ils ont un effet.

## 5. Données et sécurité

Aucune donnée de santé nouvelle ; trois préférences d'affichage, stockées comme les autres (chiffrées dans les apps). Les couleurs
sont des valeurs fixes du code, jamais une valeur saisie (pas d'injection possible par une sauvegarde modifiée). Aucun mécanisme de
sécurité modifié.

## 6. Tests réellement exécutés

**90 tests automatisés réussis sur 90** (Chromium), dont :

**« Couleur par addiction » (1)**
- un suivi (alcool en ambre) ;
- trois suivis (chacun garde sa couleur) ;
- changement de sélection (jeux d'argent en bleu) ;
- mémorisation après rechargement ;
- vue « Tout » en indigo commun ;
- vue filtrée à la couleur du suivi ;
- cartes de Mes suivis avec leur couleur.

**« Couleur par addiction » (2)**
- palette personnalisée, conservée après rechargement ;
- désactivation ;
- contrastes de toutes les palettes.

**Également exécutés :** navigation (Aide au centre), contraste réel du compteur, texte à 200 % (un débordement de la page Soutien en allemand trouvé et corrigé), contrastes AA de toute l'app (un lien trop pâle trouvé et corrigé), zones tactiles.

**Android** : compilation debug, release et AAB, 12 tests unitaires, 0 erreur de lint. iOS non compilé.

## 7. Limites

- Rendu des dégradés et du fondu à vérifier sur iPhone et Android réels.
- Le style « Souffle » (sauge/ivoire) et « Encre » sont remplacés ; leurs rapports restent dans `docs/` pour l'historique.
