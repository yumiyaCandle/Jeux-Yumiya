# Audit initial — refonte intégrale de LIBRE

22 novembre 2026. Point de départ : commit `6437887` (direction « Horizon »), étiquette Git `avant-refonte-integrale`.
Méthode : lecture du code (`libre/index.html`, projets natifs, tests), contrôle automatique des actions, 36 captures de tous les écrans,
sous-écrans et de cinq états de l'accueil (Chromium, 390 × 844). Captures : `docs/ux/avant-refonte/`.

## 1. Audit UX/UI écran par écran

Priorités : **P1** gêne réelle pour une personne en difficulté ou risque ; **P2** qualité ; **P3** finition.

| Écran | État actuel | Problèmes identifiés | Modifications prévues | Priorité |
|---|---|---|---|---|
| Bienvenue | Photo, nom, slogan, 3 atouts, action principale | Ne dit pas clairement **à qui** s'adresse LIBRE ni **ce qui la distingue** (sans compte, sans pub) | Trois promesses claires : pour qui, comment elle aide, confidentialité | P2 |
| Inscription | 6 à 11 étapes, objectifs arrêter/réduire/comprendre, difficultés, accompagnement | Correcte depuis Horizon ; la confidentialité n'est pas présentée avant de commencer | Écran « Tes données restent chez toi » intégré au début | P2 |
| Accueil | Même structure quel que soit l'état | **Ne change pas selon la situation** : en difficulté ou après une reprise, l'aide adaptée est sous la ligne de flottaison ; pas d'accompagnement des premiers jours ; objectif atteint sans suite | Carte de **situation** en tête : premiers pas, moment difficile, reprise, objectif atteint | **P1** |
| SOS (écran d'entrée) | 10 choix : 5 minutes, exercice selon l'intensité, respirer, s'ancrer, recul, autre chose, écrire, appeler, conseils, numéros | **Trop de décisions en pleine crise** ; l'aide ne dépend pas de la cause de l'envie | Un seul parcours guidé principal : ressenti → intensité → contexte → stratégie adaptée → exercice → bilan → enregistrement ; les autres choix restent accessibles | **P1** |
| 5 minutes guidées | Intensité, 4 phases fixes, bilan avec déclencheur/émotion | Phases identiques pour le stress, l'ennui, la solitude ou la pression sociale | Phases choisies selon la stratégie (souffle, ancrage, agir, parler, refuser, se reposer) | **P1** |
| Numéros d'aide | 4 groupes | La demande distingue 6 situations | 6 rubriques : danger immédiat, urgence médicale, crise psychologique, besoin de parler, soutien émotionnel, accompagnement professionnel | P1 |
| Après un écart | Formulaire complet (situation, émotion, intensité, ce qui aurait aidé, plan) | Bon contenu, mais **long d'un bloc** ; les progrès déjà faits ne sont pas rappelés dans la feuille | Rappel des acquis en tête ; ordre « ce qui s'est passé → ce qui a aidé → la suite » | P2 |
| Journal | Humeur, intensité, déclencheurs, difficultés, réussites, notes | Complet ; pas d'invite pour démarrer quand on ne sait pas quoi écrire | Amorces d'écriture facultatives | P3 |
| Statistiques | Vue d'ensemble 7 j / 30 j / 3 m / 12 m, comparaisons, graphiques | Clair ; estimations signalées | Conservé (vérifié) | — |
| Calendrier, bilans | Couleur + coche, bilans mensuels | Clair | Conservé | — |
| Outils | Exercices, « pour préparer la suite », ton espace | Bon ; deux « plans » | Un seul « Mon plan » avec plans par situation | P2 |
| Mon plan personnel / Mon plan anti-rechute | Deux écrans distincts | **Doublon de nom et de concept** ; aucun modèle pour démarrer | Plans par situation (envie, soirées, pression sociale, stress, après une période compliquée) avec modèles modifiables | P1 |
| Bibliothèque | 35 fiches sourcées, par thème | Manquent « rôle de l'entourage » et « retrouver confiance » ; en anglais pour DE/IT/ES/PT | Signalé ; nouvelles fiches à écrire avec sources et relecture professionnelle | P2 |
| Mes envies | Analyse si ≥ 4 envies | Correct | Conservé | — |
| Mon corps, Santé : quand consulter | Frises sourcées, signes d'urgence | Correct | Conservé | — |
| Profil | 3 cartes + 8 réglages au même niveau | **Liste plate** : « Photographies » au même niveau que données et sécurité ; confidentialité difficile à repérer | Sections : Mon accompagnement · Confidentialité et données · Application · Aide | P1 |
| Verrouillage | Code, aide accessible, oubli | Correct | Conservé | — |
| Notifications | Centre avec historique | Correct | Conservé | — |
| Navigation | 5 onglets + SOS en haut de chaque écran | Peu profonde, aide toujours à 1 toucher | Conservée (déjà conforme) ; libellés vérifiés | — |

## 2. Audit fonctionnel

- **Actions** : 193 boutons (`data-a`) croisés avec 202 gestionnaires : aucun bouton sans action (6 signalés par l'outil sont reliés autrement : fonctions globales ou écouteur `change`).
- **Doublons** : deux écrans « plan » ; deux entrées vers les mêmes exercices (SOS et Outils) — utile pour l'accès rapide, gardé.
- **Valeur faible** : réglage « Photographies » placé trop haut ; rangé dans « Application ».
- **Données** : 75 tests automatisés passent ; aucune donnée non enregistrée trouvée.

## 3. Audit des aides

| Aide | Compréhensible | Utilisable en crise | Adaptée au contexte | Concrète | Fiable | Décision |
|---|---|---|---|---|---|---|
| 5 minutes guidées | Oui | Oui | **Non** (phases fixes) | Oui | Techniques reconnues (respiration lente, surf de l'envie, ancrage) | Refaite : stratégies par contexte |
| Écran SOS | Oui | **Moyen** (trop de choix) | Non | Oui | — | Refait : un parcours principal |
| Surfer sur l'envie, Reporter, Respirer, S'ancrer, Questionner une pensée, Stress/ennui | Oui | Oui | Partiel | Oui | Sources affichées | Gardés (bonne qualité), appelés par les stratégies |
| Déclencheurs (journal d'envie) | Oui | Non (long) | — | Oui | — | Gardé hors crise |
| Plan anti-rechute (si… alors…) | Oui | — | **Pas de modèles** | Oui | Intentions de mise en œuvre (Gollwitzer) | Modèles par situation |
| Journée difficile | Oui | Oui | Oui | Oui | — | Gardée |
| Numéros d'aide | Oui | Oui | Partiel (4 groupes) | Oui | Sources officielles | 6 rubriques |

## 4. Audit technique et sécurité

| Domaine | Constat | Risque | Décision |
|---|---|---|---|
| Chiffrement natif | AES-256-GCM, Keystore / trousseau, IV aléatoire, 11 tests d'attaque | Faible ; iOS jamais compilé | Inchangé |
| Web | Chiffrement facultatif PBKDF2 600 000 ; CSP `connect-src 'self'` | Faible | Inchangé |
| Sauvegardes | Chiffrées par défaut, format 5 | Faible | Inchangé |
| Permissions | Notifications, Santé (lecture), biométrie désactivée ; `INTERNET` déclarée par Capacitor | Faible | Inchangé (retrait à valider sur appareil) |
| Journaux | Aucun `console.log`, logs Capacitor coupés | — | Inchangé |
| Aperçus | Voile web, écran neutre iOS, protection Android | iOS non compilé | Inchangé |
| Réseau | Aucune requête ; CSP | — | Inchangé |
| Nouvelles données de la refonte | Plans par situation, stratégie choisie, émotion | Stockées dans le même état chiffré | Documenté |

Aucune modification de sécurité n'est prévue : les mécanismes sont corrects et testés ; les changer sans nécessité serait un risque.

## 5. Plan d'action (exécuté dans cet ordre)

1. Design system v2 formalisé (jetons d'espacement, de rayons, de typographie, composants) et appliqué aux nouveaux composants.
2. Accueil adaptatif : carte de situation (premiers pas, moment difficile, reprise, objectif atteint).
3. Aide immédiate : parcours guidé en 7 étapes avec stratégies selon le déclencheur ; SOS simplifié.
4. Numéros d'aide en 6 rubriques.
5. Plans par situation avec modèles ; un seul « Mon plan ».
6. Profil réorganisé en sections.
7. Bienvenue : promesses claires ; confidentialité expliquée au début de l'inscription.
8. Traductions (6 langues), tests des 12 parcours, contrôles d'accessibilité, compilation Android, rapports, archive.
