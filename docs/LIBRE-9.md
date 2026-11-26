# LIBRE 9 — Tableau de bord

Date : 26 novembre 2026. Inspiration : une vidéo de tableau de bord commercial (CRM). Seuls ses principes ont été
repris, entièrement transposés à l'accompagnement des addictions ; aucun écran, nom, texte ou donnée de la vidéo n'est reproduit.

## Analyse de la vidéo

| Élément observé | Principe | Transposition dans LIBRE |
|---|---|---|
| Barre de sections en pilules, l'active en foncé | Passer d'une analyse à l'autre en un geste | Pilules en haut de toutes les pages de Parcours (10 sections) |
| Titre + chiffres clés avec icône ronde et badge de variation | Lire l'essentiel en 2 secondes | Jours réussis du mois (± vs mois dernier), économies, % d'envies traversées |
| Courbe lissée, choix de période, objectif en pointillés, bulle au survol | Graphique vivant | Consommation par semaine (3/6/12 mois), limite hebdomadaire en pointillés, bulle au toucher ou au survol |
| Tuiles colorées « affaires à suivre » | Mettre en avant ce qui compte | « Moments marquants » : meilleure série, meilleure semaine, déclencheur principal, dernière étape, envies traversées ; chacun ouvre une fiche |
| Pipeline en colonnes par étape, cartes colorées par colonne | Faire progresser des éléments | Tableau des stratégies : À essayer → En test → Ça m'aide / Pas pour moi |
| Carte qui s'ouvre en fiche : barre d'étapes, champs, action « étape suivante → » | Détail et action au même endroit | Fiche stratégie : étapes, essais, dernier essai, envies traversées avec l'exercice lié, avis personnel, « Passer à … → » |
| Annuaire + fiche avec historique en tuiles | Comprendre une relation dans le temps | Annuaire des déclencheurs + fiche (fréquence, intensité, part traversée, moment, historique en tuiles colorées, conseil, plan « si… alors… ») |
| Facture avec tampon « Payé », Télécharger, Copier le lien | Document clair et partageable | Relevé d'économies mensuel avec tampon « Économisé / En cours », Imprimer/PDF, Copier le résumé (rien n'est envoyé) |
| Pages Finance et Growth | Graphiques d'argent et de répartition | Économies : courbe cumulée, dépenses par semaine, répartition par addiction |
| Fond blanc cassé, cartes très arrondies, tuiles très colorées | Chaleur et lisibilité | Crème et verre ; tuiles, colonnes, pastilles et historique dans les teintes de l’addiction affichée (vert sauge pour le tabac, ambre pour l’alcool…), comme la barre en verre liquide |

## Fonctionnalités (toutes calculées à partir des données réelles)

- **Vue d'ensemble** (`#apercu`) : chiffres clés, courbe interactive, moments marquants.
- **Stratégies** (`#strategies`) : ajout libre ou en un toucher depuis des idées (exercices, plan, plans « si… alors… », activités), essais
  comptés, déplacement par bouton ou glisser-déposer (ordinateur) ; une stratégie classée « Ça m'aide » rejoint automatiquement le plan.
  Données : `board.cards[]` (vérifiées à la lecture).
- **Déclencheurs** (`#declencheurs`) : consommations, envies et journal réunis par déclencheur.
- **Économies** (`#economies`) : estimations à partir du budget déclaré et des consommations notées ; relevé des 3 derniers mois.

Tests : 5 nouveaux tests « Tableau de bord » / « Données ». Traductions en, de, it, es, pt. Aucune connexion ajoutée.
