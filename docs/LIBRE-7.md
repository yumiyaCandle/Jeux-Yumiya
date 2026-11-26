# LIBRE 7 — Nuit & Sauge

Date : 26 novembre 2026. Amélioration de l'application existante : rien n'a été supprimé, les données et les anciennes
sauvegardes restent compatibles, tout fonctionne en local sans connexion.

## Ce qui existait déjà et a été conservé (et réutilisé)

Inscription, suivis multiples, arrêt / réduction / observation, compteurs et historiques, envies et déclencheurs, SOS guidé
de 5 minutes (intensité 1–10, émotion, déclencheur, respiration, ancrage, minuteur, action, contact, bilan après), journal guidé
avec filtres et recherche, calendrier, statistiques, bilans, étapes (badges en jours), plans « si… alors… », plan personnel,
bibliothèque sourcée, personnes de confiance, notifications, profil en 9 catégories, sauvegarde chiffrée, verrouillage, comptes
facultatifs, recherche globale, mode discret, historique.

L'espace « envies » demandé (intensité, émotion, déclencheur, exercices adaptés, minuteur, respiration, ancrage, activité de
remplacement, contact, bilan après, historique) existait déjà dans le SOS guidé ; il est maintenant relié au coach, à l'évolution
et aux motivations (bouton « Relire mes motivations » dans le SOS).

## Nouvelle identité

- Bandeaux toujours **bleu nuit**, lueur **sauge**, fond **crème**, cartes blanc cassé.
- Titres et textes dans **une seule police, celle du logo LIBRE** (Inter, incluse dans l’app, sans téléchargement) : titres très gras (800), sous-titres 750, textes courants en Inter normal.
- La couleur propre à chaque addiction ne colore plus que les accents (boutons, barres, anneaux) : l'identité reste commune.
- Clair et sombre redéfinis ; contrastes vérifiés (AA) sur tous les écrans, y compris les nouveaux.
- Animations d'apparition discrètes, désactivées si « réduire les animations » est activé.

## Accueil

Dans l'ordre : bienvenue et message adapté → **compteur principal** (anneau vers la prochaine étape) → chiffres clés
personnalisables → **Ta progression** (aujourd'hui, semaine, économies avec projection mensuelle, 7 derniers jours) →
**Objectifs du jour** et défis de la semaine → situation du moment → **Ton humeur** (7 jours) → ta journée (humeur, petit objectif,
conseil replié) → **Ta motivation** (une raison, une phrase ou une photo, qui change chaque jour) → **Prochaines étapes**
(étape suivante par addiction, mission du programme, niveau suivant) → **Mes addictions** (aperçu de chaque suivi) → aide
immédiate et consommations du jour → détails repliés.

## Nouvelles fonctionnalités

| Fonction | Où | Ce qu'elle fait, à partir des données réelles |
|---|---|---|
| **Mon coach** | Soutien, accueil, recherche | Bilan (jours depuis la dernière consommation, jours réussis sur 7, comparaison à la semaine précédente, envies traversées, tendance de l'humeur), encouragement selon les efforts de la semaine, objectifs du jour, défis de la semaine, conseils selon les déclencheurs les plus fréquents et le moment à risque, activités selon l'émotion la plus notée, situations difficiles. Avertissement : pas de diagnostic. |
| **Programme de 30 jours** | Soutien | 30 missions progressives (motivations, déclencheurs, habitudes, alternatives, bilans J5/J7/J14/J30, prévention, reprise…), adaptées si toutes les addictions sont en réduction. Note facultative par jour, jours manqués rattrapables sans pénalité, redémarrage qui garde l'historique. Présenté comme une aide à l'organisation, jamais comme une garantie. |
| **Récompenses** | Parcours | Points d'effort (journal, humeurs, envies traversées, exercices, plans, petits objectifs, missions, jours réussis, étapes) recalculés à partir des données : **une reprise ne retire rien**. 9 niveaux, 14 badges d'effort datés (dont « Rebond » après une reprise), défis hebdomadaires (3 par semaine, adaptés), objectifs personnels, historique des réussites. |
| **Mes motivations** | Soutien, accueil, SOS | Raisons, objectifs futurs, phrases, souvenirs datés, liste à accomplir (cochable), jusqu'à 6 photos réduites (640 px, JPEG) gardées sur l'appareil et incluses dans les sauvegardes. |
| **Comprendre mon addiction** | Soutien, recherche | 9 catégories (tabac, vape/nicotine, alcool, cannabis, jeux d'argent, réseaux sociaux, écrans, jeux vidéo, autres), 6 rubriques chacune (mécanisme, déclencheurs, habitudes, difficultés, stratégies, quand demander de l'aide), numéros d'aide du pays, articles liés, **sources citées** (uniquement des références déjà présentes et vérifiées dans LIBRE). Avertissement sevrage pour l'alcool et les substances. |
| **Mon évolution** | Parcours | Par addiction : jours réussis, meilleure série, économies, envies, objectifs atteints ; graphiques sur 8 semaines et 6 mois (quantités, jours réussis, envies, humeur) ; comparaison avec le mois précédent ; difficultés (déclencheurs, reprises présentées comme des informations). |
| **Plan de prévention** | Soutien (ex-« Mon plan ») | Ajout : émotions difficiles, activités de remplacement, **plan en cas de reprise** (avec propositions non culpabilisantes), en plus des situations, stratégies, plans « si… alors… », personnes et objectifs déjà présents. |

## Données et compatibilité

Nouvelles rubriques : `prog` (programme), `motiv` (motivations), `ach` (dates des badges d'effort). Elles sont vérifiées à la lecture
(`v7Norm`) : une sauvegarde ancienne n'en a pas et fonctionne telle quelle ; une rubrique abîmée est ignorée ; seules des images
`data:image/jpeg|png|webp` sont acceptées. Tout passe par les mécanismes existants (stockage local, coffre natif chiffré,
chiffrement web facultatif, export chiffré, compte chiffré de bout en bout).

## Sécurité et santé

Aucune nouvelle connexion, aucune bibliothèque externe, CSP inchangée. Les conseils restent des informations générales ;
l'alcool, les anxiolytiques, somnifères et opioïdes sont signalés comme nécessitant un avis médical avant l'arrêt. Les exercices
ne sont jamais présentés comme un traitement.

**Sources non ajoutées** : je n'ai pas pu vérifier depuis cet environnement la fiche OMS « Gambling » ni la CIM-11 en ligne
(accès refusé). Les fiches « jeux d'argent », « réseaux sociaux » et « écrans » s'appuient donc sur les sources déjà vérifiées
(FAQ OMS sur le trouble du jeu vidéo/CIM-11, plans d'implémentation, surf de l'envie, ressources suisses). À compléter par
une revue médicale avant publication (voir `VALIDATION-MEDICALE.md`).

## Tests

`npm run test:e2e` : suite complète (anciens tests + nouveaux : coach, programme, récompenses, motivations avec photo,
comprendre, évolution, prévention, compatibilité des anciennes sauvegardes et rubriques corrompues). `npm run check:contrast`
inclut les nouveaux écrans. Non testé ici : iPhone et Android physiques.
