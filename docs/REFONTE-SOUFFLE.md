# LIBRE « Souffle » : une identité chaleureuse pour accompagner

22 novembre 2026. Base : `756f129` (« Encre » finie, étiquette `avant-souffle`). Comparaisons au format iPhone (Encre à gauche,
Souffle à droite) : `docs/ux/souffle/*.jpg`. **Implémenté dans le vrai projet, testé automatiquement dans Chromium. Aucun essai sur
téléphone réel ; l'app iOS n'a jamais été compilée (pas de Mac).**

## 1. Pourquoi changer encore

Ton constat : le crème, les grands panneaux noirs et les accents dorés évoquaient un tableau de bord financier ou un produit de luxe,
pas un lieu d'accompagnement. Les personnes qui ouvrent LIBRE peuvent être fatiguées, inquiètes, découragées ou en train de se
reprocher une reprise. Elles doivent sentir qu'elles sont **accueillies, pas évaluées**.

## 2. Palette : chaque couleur a une fonction

| Rôle | Couleur | Clair | Sombre | Où |
|---|---|---|---|---|
| Fond | Ivoire | `#FAF7F1` | `#161A18` | Toutes les pages |
| Fond chaleureux | Sable | `#F2ECE2` | `#232925` | « Ta journée », Mon kit, question du journal |
| **Couleur de marque** | **Sauge** | `#4C7A66` (texte : `#3B6453`) | `#8CC2A8` | Bouton principal, onglet actif, chiffres du chemin, coches |
| Fond de marque | Sauge très clair | `#EFF4EF` / `#E4EEE7` | `#1D2A23` | Ton chemin, aide immédiate, puces de situation |
| **Couleur secondaire** | **Bleu-vert** | `#2F7480` | `#8CC6CE` | Liens, informations, « Pourquoi je vois ça ? » |
| **Accent humain** | **Pêche / terracotta** | `#E39A7B`, fond `#FCEEE6`, texte `#8E4128` | `#E9A88C` | Bouton « Aide », « J'ai une envie » à l'accueil, carte de situation, logo |
| Texte | Charbon chaud | `#2A302C` / `#5D6660` | `#E9ECE7` / `#A9B2AC` | — |
| Positif | Sauge | — | — | Jours sans, réussites |
| Neutre | Sable, gris chaud | `#B9B3A6` | — | Humeur neutre, filets |
| Alerte (réservé) | Rouge | `#B42318` | `#F08A7E` | Danger uniquement |

Humeurs : une gamme douce de la terre à la sauge (au lieu du rouge-orange-bleu-vert). Aucun dégradé, aucun noir, aucun doré.

## 3. Typographie et formes

- Titres en **police arrondie** (SF Pro Rounded sur iPhone ; Nunito ou Inter sinon), graisse 650, sans italique ni serif. Texte en Inter.
- Surfaces : beaucoup d'ivoire, **quelques panneaux doux** (sable, sauge très clair, pêche) aux coins arrondis de 20 px, pour les
  blocs qui le méritent ; les listes restent séparées par des filets fins.
- Boutons : sauge plein (principal), contour sauge (secondaire), lien bleu-vert souligné (tertiaire). Rayon 14 px.
- Logo : cercle ouvert ivoire et point pêche (le jour qui se lève) sur fond sauge. Icônes iOS/Android/web, écrans de lancement et
  captures des stores régénérés.

## 4. Accueil : la personne avant le compteur

| Avant (Encre) | Souffle |
|---|---|
| Grand panneau noir du compteur en tête | Ordre repensé : **salutation** et message → **carte de situation** si besoin → **Ta journée** (comment te sens-tu, conseil du jour, petit objectif) → **Ton chemin** (le compteur, dans un panneau sauge clair, chiffre en sauge) → **Si une envie arrive** (« J'ai une envie » sur fond pêche, 4 gestes rapides, journée difficile) |
| Message « Tu bats ton record personnel. Chaque minute est un nouveau record. » | « C'est ta plus longue période sans… Prends un instant pour le remarquer : tu avances, à ton rythme. » |
| « Agir maintenant » | « Si une envie arrive » |

Les messages d'accueil changent selon la situation et le jour (inchangé). Réduction et observation gardent leur présentation sans
compteur de jours sans.

## 5. Navigation

| Onglet | Avant | Maintenant |
|---|---|---|
| 1 | Aujourd'hui | **Aujourd'hui** |
| 2 | Soutien | **Soutien** |
| 3 | Progrès | **Parcours** (page « Mon parcours ») : on parle de chemin, pas de performance |
| 4 | Journal | **Journal** |
| En-tête | Bouton « Aide » contour noir | Bouton **« Aide »** pêche, présent sur chaque page |

Onglet actif : icône dans une pastille sauge claire.

## 6. Aides

- **Aide immédiate** : passe du plein écran noir à un fond **sauge très clair**, apaisant. « J'ai une envie » en sauge plein ; les
  autres besoins sur des surfaces blanches ; « Je suis en danger » en rouge.
- **Mon kit** (nouveau, dans Soutien), ce que la personne a préparé pour les moments difficiles, au même endroit :
  - **mes personnes de confiance** (appel en un toucher, ajout direct) ;
  - **mes stratégies** (plans « si… alors… », création) ;
  - **mes raisons** (relues quand la motivation baisse) ;
  - **mes exercices préférés**.
- Conservés et restylés : fiches « Selon ce que tu traverses » interactives, « Ce qui t'aide », aide guidée en 7 étapes, parcours
  après une reprise (avec « Ce qui reste acquis » et le lien vers la fiche du déclencheur), journal guidé, lecture expliquée des
  données, bibliothèque par thèmes.

## 7. Ce qui est supprimé ou remplacé

| Élément | Remplacé par |
|---|---|
| Panneaux noirs, accents dorés, titres en serif | Panneaux sauge clair / sable / pêche, titres arrondis |
| Section « Mes plans » de Soutien | Intégrée à « Mon kit » (avec proches, raisons, favoris) |
| Liste des favoris en tête des exercices | Dans « Mon kit » ; rappel en une ligne dans « Exercices » |
| Message « chaque minute est un nouveau record » | Message sans logique de performance |

Aucune donnée touchée, aucune migration nécessaire, aucune fonction utile supprimée. L'ancien style « verre » reste en option.

## 8. Tests réellement exécutés

- 88 tests automatisés dans Chromium : **88 réussis**. Le test de contraste du bloc principal a été **réécrit** : il ne suppose plus
  un texte blanc sur fond foncé ; il mesure chaque texte (couleur réelle) sur son fond réel, en clair et en sombre, pour les
  5 réglages de couleur : tous ≥ 4,5:1.
- Contrastes AA de toute l'app, zones tactiles, texte à 200 % (fr, de) : conformes.
- Revue visuelle à 393 × 852 et 375 × 667, clair et sombre (simulation de taille, pas un iPhone réel).
- Android : compilation debug, release et AAB, 12 tests unitaires, 0 erreur de lint. iOS : non compilé.

## 9. Limites

- La police arrondie dépend du système : SF Pro Rounded sur iPhone (à vérifier sur appareil) ; ailleurs, Inter.
- Pas de test avec des personnes concernées : c'est la prochaine étape la plus utile pour juger de l'ambiance.
- Contenus d'aide toujours à faire relire par un professionnel (`VALIDATION-MEDICALE.md`).
