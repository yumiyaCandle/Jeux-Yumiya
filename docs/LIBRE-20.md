# LIBRE 20 — reconstruction de l'expérience

Demande de la personne propriétaire : repenser entièrement la navigation, les aides et le suivi, pour que LIBRE soit un vrai compagnon d'accompagnement des addictions. Les fonctions qui marchaient et qui sont utiles sont conservées : rien n'est simulé, aucune donnée n'est perdue, et les anciennes sauvegardes restent compatibles. Le style visuel est LIBRE 19 « Verre » ([LIBRE-19.md](LIBRE-19.md)).

## Navigation : 5 onglets

| Onglet | Contenu | Anciennes pages regroupées |
|---|---|---|
| **Accueil** | Bonjour + prénom, phrase d'encouragement, objectif ; compteur ; 2 à 4 chiffres en cartes ; « Comment tu te sens aujourd'hui ? » (de « Très bien » à « Très difficile ») ; « Ton objectif du jour » (une action) ; accès rapide (J'ai une envie, J'ai besoin d'aide, Ajouter une activité) ; aperçu de la semaine | Accueil |
| **M'aider** | « De quoi as-tu besoin maintenant ? » : 5 situations avec des actions concrètes, plus un encadré « Urgence médicale » | Mon plan, outils, plan de prévention, motivations, déclencheurs, santé |
| **Mon suivi** | Noter en un geste (envie, consommation, émotion, moment difficile, réussite, remarque) ; chiffres ; courbe de consommation ; moral et intensité des envies sur 14 jours ; objectif d'épargne ; étapes ; liens vers journal, calendrier, économies, bilan, statistiques, objectifs | Progrès, Journal, Statistiques, Calendrier, Économies, Bilans |
| **Comprendre** | Recherche ; « Les bases » ; « Les addictions » (20 fiches, substances et comportements) ; « Questions » (FAQ) ; « Ressources » (organismes suisses et numéros d'aide) | Comprendre, Bibliothèque |
| **Profil** | Compte, addictions et objectifs, notifications, langue, confidentialité et sécurité, sauvegardes, Apple Santé (natif), assistance | Profil, Habitudes |

Le bouton **« J'ai besoin d'aide »** reste en permanence :
- sur ordinateur, dans la barre latérale ;
- sur téléphone, l'onglet « M'aider » (en rouge) et le bouton de l'accueil y mènent.

## M'aider maintenant

| Situation | Action principale | Autres actions |
|---|---|---|
| J'ai envie de consommer | Aide guidée existante (ressenti, intensité, contexte, stratégie, exercice, bilan enregistré) | Attendre 10 minutes, respirer, surfer sur l'envie, questionner la pensée, ancrage, appeler un proche, sortir d'une situation à risque |
| Stress ou anxiété | Respiration (3 min) | Ancrage 5-4-3-2-1, action contre le stress, écrire d'où vient le stress, en parler |
| Peur de rechuter | Plan « si… alors… » | Signaux d'alerte, situations à risque, proches, plan complet |
| J'ai rechuté | Faire le point (déclencheur, émotion, ce qui aurait aidé, prochaine étape) | Noter la consommation (l'historique est gardé), préparer la prochaine fois, pistes pour aujourd'hui, en parler |
| Je me sens seul·e | Contacter une personne de confiance | Lignes d'écoute, aide professionnelle, écrire ce que je ressens |

Ces situations sont ordonnées selon la réponse à « Qu'est-ce qui est le plus difficile en ce moment ? » (inscription).

L'encadré « Urgence médicale » :
- affiche les numéros du pays (en Suisse : 144, 112, 145 Tox Info Suisse) ;
- prévient que l'arrêt brutal de l'alcool, des benzodiazépines, du GHB ou de certains médicaments peut être dangereux.

## Inscription

Le parcours existant est conservé (prénom, addictions avec une principale, objectif, ancienneté, fréquence, budget, dernière fois, accompagnement, raisons). Ajouts :
- **Accueil** : « Bienvenue sur LIBRE. Ici, tu peux avancer à ton rythme, sans jugement. »
- **Objectifs** : arrêter, réduire, **mieux contrôler**, comprendre, **je ne sais pas encore**. Les deux nouveaux sont enregistrés dans `goalNote` : « mieux contrôler » utilise le suivi par limite, « je ne sais pas encore » utilise l'observation sans chiffre.
- **Questions** :
  - « Dans quelles situations tes envies sont-elles les plus fortes ? »
  - « Qu'est-ce qui est le plus difficile en ce moment ? »

  Elles sont facultatives et enregistrées sur l'appareil.

## Comprendre : contenus et sources

- 11 nouvelles fiches :
  - **substances** : cocaïne et crack, héroïne et opioïdes, benzodiazépines et somnifères, amphétamines et méthamphétamine, MDMA, LSD et hallucinogènes, kétamine, GHB/GBL ;
  - **comportements** : achats compulsifs, pornographie et sexualité compulsive, travail et sport excessifs.
- Chaque fiche ne cite que des sources déjà présentes et vérifiées dans l'app (NIDA, OMS, HAS, NICE, Tox Info Suisse, Addiction Suisse, articles cités).
- Pas de diagnostic, pas de délai de guérison promis. La différence entre habitude, usage problématique et dépendance est expliquée.
- Ressources : SafeZone.ch, Addiction Suisse, Indexaddictions.ch, stop-tabac.ch, Tox Info Suisse, OFSP. Ces adresses étaient déjà dans l'app (vérifiées en nov. 2026).
- **Infodrog n'a pas été ajouté** : l'adresse n'a pas pu être vérifiée depuis l'environnement de travail, car son réseau bloque l'accès.

## Tests

- **Scénarios 2, 3 et 4 du brief** (envie, suivi, rechute) : ajoutés à `tests/suite.js` (« LIBRE 20 »).
- **Scénarios 1 et 5** (inscription par e-mail et par téléphone, déconnexion, reconnexion, données conservées, suppression du compte) : couverts par `tests/accounts.js` contre le vrai serveur.
- **Langues** : 6 langues, 0 texte manquant (`python3 tools/i18n.py audit`).
- **Contrôles** : contrastes AA et zones tactiles, avec les nouvelles pages ajoutées aux deux contrôles.
