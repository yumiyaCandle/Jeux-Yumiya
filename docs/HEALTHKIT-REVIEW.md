# Revue de l'intégration Santé Apple (HealthKit)

22 novembre 2026. Code : `libre-app/ios/App/App/LibreHealthPlugin.swift` et `hkSync` / `hkRender` dans `libre/index.html`.
**Le code Swift n'a jamais été compilé ni exécuté** (pas de Mac) ; les tests utilisent un plugin simulé.

## 1. Données et autorisations

Lecture seule (`toShare` vide). Mesures : pas, distance, minutes d'exercice, énergie active, fréquence cardiaque, fréquence cardiaque au repos,
variabilité (SDNN), fréquence respiratoire, sommeil. Seules les mesures cochées par l'utilisateur sont demandées.
Description iOS (6 langues) identique à la politique de confidentialité.

## 2. Agrégation

| Point | Constat | État |
|---|---|---|
| Sommes et moyennes | `HKStatisticsCollectionQuery` par jour (`cumulativeSum` ou `discreteAverage`), qui fusionne les sources (iPhone + Apple Watch) selon les priorités de Santé : pas de double comptage | Correct |
| Unités | Pas (count), km, minutes, kcal, battements/min, ms (SDNN), respirations/min | Correct |
| Jours sans données | Absents (pas mis à zéro) | Correct |
| Limites de journée, fuseau | `Calendar.current` + formateur de dates. **Défaut corrigé** : le formateur gardait le fuseau du lancement de l'app ; il est recalé à chaque lecture | Corrigé (non compilé) |
| Changements d'heure, années bissextiles | Gérés par `Calendar` (intervalles d'un jour civil) | Correct en théorie, à vérifier sur appareil |
| Données arrivées en retard | **Défaut corrigé** : la resynchronisation relisait 2 jours ; elle relit maintenant 7 jours (synchronisation tardive de la montre) | Corrigé, testé (simulé) |
| Doublons | Les jours sont remplacés par date, jamais ajoutés | Testé (simulé) |
| Valeur supprimée dans Santé après lecture | Reste dans LIBRE jusqu'à la prochaine lecture de ce jour | Limite connue |

## 3. Sommeil

Seules les phases « endormi » (non précisé, cœur, profond, paradoxal) sont comptées ; « au lit » et « éveillé » sont exclues. Les intervalles
qui se chevauchent (iPhone + montre) sont **fusionnés** avant addition. La nuit compte pour **le jour du réveil**. Lecture à partir de 18 h la
veille du premier jour. Limite : une sieste l'après-midi s'ajoute au sommeil du même jour.

## 4. États affichés

iOS ne dit pas à une app si la lecture a été refusée. LIBRE n'affiche donc plus « Connecté » :

| État affiché | Signification |
|---|---|
| Indisponible ici | Navigateur ou Android : pas de Santé Apple |
| Non disponible sur cet appareil | Santé absent (iPad ancien…) |
| Non connecté | Rien demandé |
| Autorisation demandée, aucune donnée reçue | Demande faite ; refus, absence de données, ou révocation : impossible de distinguer (texte d'aide vers Réglages › Santé) |
| Données reçues | Au moins un jour de données |
| + « synchronisation incomplète » / « a échoué » | Erreurs partielles ou échec de la dernière lecture ; les données déjà reçues restent |

Déconnecter efface toutes les données Santé copiées dans LIBRE (testé, simulé). Retirer l'autorisation se fait dans Réglages iOS ; LIBRE
continue alors de lire « rien » sans erreur.

## 5. À tester sur un vrai iPhone (et si possible une Apple Watch)

Voir `TESTS-APPAREILS.md` § Santé Apple et scénario 5 de `TESTS.md`. Comparer, pour 3 jours, les valeurs de LIBRE avec l'app Santé
(pas, sommeil de la nuit, fréquence cardiaque au repos), révoquer l'accès, réactiver, changer de fuseau horaire.
