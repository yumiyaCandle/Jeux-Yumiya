# LIBRE « Encre » : nouvelle génération

22 novembre 2026. Base : `95cd4b9` (« Envol », étiquette `avant-encre`). Comparaisons sur trois colonnes, écran par écran (ce matin ·
Envol · Encre) : `docs/ux/encre/*.jpg` ; tous les écrans Encre : `docs/ux/encre/ecrans/`.
**Implémenté dans le vrai projet et testé automatiquement dans Chromium. Aucun essai sur téléphone réel ; l'app iOS n'a jamais été
compilée (pas de Mac).**

## 1. Pourquoi tout reprendre

Ton constat sur « Envol » était juste : dégradés violets partout, une carte arrondie pour chaque bloc, des boutons tous semblables, des
bandeaux colorés identiques d'un écran à l'autre. C'est le vocabulaire des modèles génériques. « Encre » part dans la direction opposée.

## 2. Direction artistique « Encre »

| Principe | Application |
|---|---|
| **Éditorial, pas « application à cartes »** | Les contenus sont posés sur le papier et séparés par des **filets fins**, comme dans un livre ou un journal de qualité. Plus de cartes empilées ni imbriquées |
| **Trois matières** | Papier `#F6F3EC`, encre `#17181C`, **un seul accent : le safran** `#E2A21B` (la lumière qui passe par l'ouverture du logo). Vert sobre pour les réussites, rouge réservé à l'urgence. Aucun dégradé, aucun violet |
| **Deux voix typographiques** | **Serif** (New York sur iPhone, Iowan/Georgia ailleurs) pour les titres, les chiffres et les phrases qui parlent à la personne ; **Inter** pour l'interface. Surtitres en petites capitales précédés d'un trait safran |
| **Une seule surface foncée par écran** | Le compteur de l'accueil, le grand bouton « J'ai une envie », l'aide immédiate (plein écran encre) : le regard sait où aller |
| **Boutons à trois niveaux** | Plein encre (action principale) · contour encre (secondaire) · lien souligné safran (tertiaire). Jamais deux niveaux identiques côte à côte |
| **Onglets internes soulignés** | Fini les pastilles : le texte, et un trait safran sous l'onglet actif |
| **Compositions propres à chaque page** | Bienvenue en liste numérotée 01–04 ; Soutien en sections numérotées ; journal en fil chronologique ; bibliothèque en table des matières |
| **Logo** | Un cercle ouvert et un point safran dans l'ouverture ; mot-symbole « libre. » en serif, le point en safran. Icônes iOS/Android/web et écrans de lancement : fond encre |
| **Mouvement** | Retour immédiat à l'appui (léger enfoncement), aucune animation décorative ; tout reste conforme à « moins d'animations » |
| **Mode sombre** | Encre profonde `#121315`, papier devenu texte, safran plus lumineux |

Design system complet : `DESIGN-SYSTEM.md` § Encre.

## 3. Nouvelle navigation

| Avant (Envol) | Encre | Pourquoi |
|---|---|---|
| Aujourd'hui · Suivi · [Aide] · Journal · Ressources (barre flottante, bouton central) | **Aujourd'hui · Soutien · Progrès · Journal** (barre posée, 4 onglets nommés par leur contenu) | Quatre lieux clairs. « Soutien » dit ce qu'on y trouve ; « Progrès » remplace « Suivi » |
| Bouton Aide central | **Bouton « Aide » dans l'en-tête de chaque page** (point rouge), à côté des notifications et du profil | Un toucher depuis n'importe où, toujours au même endroit, sans bouton flottant |
| Ressources = liste d'outils | **Soutien = centre d'accompagnement** (voir § 4) | L'aide n'est plus un catalogue mais un parcours |
| Profil par l'avatar | Inchangé | — |

## 4. Le centre de soutien (nouveau)

Une page organisée comme un sommaire, en sections numérotées :

1. **Maintenant** : « J'ai une envie » (aide guidée en 7 étapes), respirer 2 minutes, revenir au présent, « Je suis en danger » (urgences
   et lignes d'écoute du pays).
2. **Selon ce que tu traverses** (nouveau) : sept accompagnements distincts : le stress, l'ennui, la solitude, la pression sociale,
   les émotions difficiles, les automatismes, une situation à risque qui approche. Chacun ouvre une fiche avec :
   - une explication courte et humaine ;
   - **trois gestes concrets**, numérotés ;
   - l'exercice adapté (respiration, ancrage, report, déclencheurs…) ou, pour la solitude, l'appel direct de ton proche ;
   - **« Préparer mon plan pour ce moment »** : ouvre le plan « si… alors… » déjà prérempli avec le modèle correspondant ;
   - **« Comprendre »** : ouvre le thème correspondant de la bibliothèque ;
   - le rappel que ce sont des pistes d'accompagnement, pas un traitement.
3. **Pour toi, en ce moment** : la recommandation personnalisée, avec sa raison.
4. **Exercices** : tous les exercices, favoris en tête.
5. **Mes plans** : tes plans « si… alors… », création en un toucher, pensées questionnées.
6. **Comprendre et s'orienter** : bibliothèque, envies et déclencheurs, corps, santé, plan personnel.

## 5. Les autres écrans

| Écran | Maintenant |
|---|---|
| Bienvenue | Papier, mot-symbole, grand titre en serif « Chaque jour, un pas vers ta liberté. », 4 promesses numérotées, bouton encre |
| Aujourd'hui | En-tête éditorial (date, salutation, message) ; compteur encre centré ; « Agir maintenant » en rangées séparées par des filets ; moment à risque expliqué ; carte de situation (difficulté, reprise, premiers pas) signalée par un trait de couleur |
| Aide immédiate | Plein écran encre, « De quoi as-tu besoin, là, maintenant ? », 4 besoins en rangées ; « J'ai une envie » marqué en safran |
| Progrès | 4 onglets soulignés (Mes suivis · Statistiques · Calendrier · Bilans), lecture expliquée en tête, graphiques encre |
| Journal | Question du jour signalée par un trait safran, fil chronologique sans cartes |
| Bibliothèque | Table des matières des 11 thèmes en serif |
| Profil, réglages, plan, santé | Sections à filets, sans cartes |
| Feuilles et fenêtres | Papier, titres serif, coins discrets |

## 6. Ce qui est supprimé ou remplacé

| Élément | Remplacé par | Raison |
|---|---|---|
| Barre flottante et bouton Aide central | Barre posée à 4 onglets + bouton « Aide » dans l'en-tête | Lisibilité, moins d'effet « template », aide toujours au même endroit |
| Onglet « Ressources » | Onglet « Soutien » (centre d'accompagnement) | Organisation par besoin, pas par type d'outil |
| Bandeaux en dégradé, cartes flottantes | En-tête éditorial et filets | Direction artistique |
| Tuiles d'exercices rapides | Section « Maintenant » | Moins de choix au moment difficile |

Aucune fonctionnalité utile supprimée, aucune donnée touchée, aucune migration nécessaire (seul l'affichage change ; les adresses des
pages restent les mêmes). L'ancien style « verre » reste disponible en option.

## 7. Sécurité

Aucun mécanisme modifié. Aucune nouvelle donnée : les fiches de situation sont du contenu fixe ; les plans créés depuis une fiche
utilisent le stockage existant (chiffré dans les apps).

## 8. Tests réellement exécutés

- 87 tests automatisés dans Chromium : **87 réussis**. Nouveau : « Soutien » (7 situations, 3 gestes, plan prérempli, lecture,
  danger). Mis à jour : navigation (4 onglets, bouton Aide dans l'en-tête), triage de l'aide.
- Défauts trouvés et corrigés pendant la refonte : en-tête qui débordait avec le texte à 200 % en allemand, thème de bibliothèque
  débordant à 200 %, onglets de période trop étroits (cible de 22 px), point safran du logo signalé par le contrôle de contraste
  (devenu un élément graphique).
- Contrastes AA clair et sombre, zones tactiles, texte à 200 % (fr, de) : conformes.
- Android : compilation debug, release et AAB, 12 tests unitaires, 0 erreur de lint. iOS : non compilé. Aucun appareil réel.

## 9. Limites et tâches restantes

- Pas de test avec des personnes ; pas de VoiceOver/TalkBack réels.
- Les 7 fiches de situation (explications et gestes) sont des outils d'accompagnement courants **non validés par un professionnel** :
  à faire relire (`VALIDATION-MEDICALE.md`).
- La police serif dépend du système (New York sur iPhone, Georgia ou équivalent sur Android) : rendu à vérifier sur appareil.
- Nouveau logo à inclure dans la recherche de marque.
