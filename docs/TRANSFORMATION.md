# Transformation de LIBRE : direction « Horizon » et accompagnement repensé

22 novembre 2026. Base : commit `6c21f89` (étiquette `avant-transformation`). Tout ce qui est décrit ici est implémenté dans
`libre/index.html` et testé automatiquement dans Chromium (voir § 6) ; rien n'a été essayé sur un téléphone réel.

## 1. Ce que j'ai constaté avant de transformer

| Constat | Pourquoi c'était un problème |
|---|---|
| Style « verre et photos » partout : flou d'arrière-plan, photo d'ambiance derrière le texte, anneaux concentriques, pastilles en orbite, barres multicolores | Beaucoup d'effets, peu d'information ; lisibilité variable ; coûteux sur un téléphone modeste ; identité peu distinctive |
| **En mode réduction, l'accueil affichait un grand compteur « jours sans »** | Décourageant et contraire à l'objectif choisi ; c'est exactement ce que la personne n'a pas demandé |
| **L'inscription demandait obligatoirement âge, sexe, taille et poids** | Ces données de santé n'étaient utilisées par **aucun calcul** (seulement affichées dans le profil) : collecte inutile, 3 écrans de plus |
| Pas d'objectif « mieux comprendre » | Une personne qui veut d'abord observer devait choisir « arrêter » ou « réduire » |
| L'aide face aux envies venait après le suivi du jour sur l'accueil | En situation difficile, l'aide doit être la première chose trouvée |
| Rien pour une « journée difficile » en dehors du SOS | Le SOS vise une envie ; une journée lourde demande d'autres réponses (écrire, parler, alléger) |
| Numéros d'aide en liste unique | En crise, il faut trouver le bon numéro selon la situation, pas lire une liste |
| Bilan d'envie sans déclencheur ni émotion | Information précieuse perdue au moment où elle est la plus fraîche |
| Recommandations non désactivables ; difficultés connues ignorées tant qu'il n'y avait pas de données | Personnalisation non contrôlable ; début de parcours générique |
| **Défaut** : un choix à avancement automatique suivi d'un appui rapide sur « Continuer » sautait une étape de l'inscription | La personne pouvait ne jamais voir une question |
| **Défaut** (créé puis corrigé pendant le travail, détecté par les tests) : la couleur d'accent choisie aurait été ignorée par le nouveau style | — |

## 2. Nouvelle direction artistique « Horizon »

Intention : **calme, digne, sérieux, porteur d'espoir.** Références étudiées (bonnes pratiques, sans reprise d'identité) : applications de
santé mentale et de méditation (sobriété, une action principale par écran, vocabulaire bienveillant), guides Apple (*Designing Fluid
Interfaces*, *Principles of Great Design*, matériaux : « une tâche modale = surface pleine + voile ; ne jamais empiler deux verres clairs »).

| Élément | Avant | Horizon |
|---|---|---|
| Fond | Photo floue + dégradé chaud | Lin uni `#F4F1EA` (clair), nuit `#0C121D` (sombre) |
| Encre / action | Bleu marine + dégradés sur les boutons | Encre bleu nuit `#152238` **pleine**, une seule couleur d'action |
| Progression | Vert vif | Sauge `#3F7F6E` / `#2E6A5B` (texte), pâle `#E3EFEA` |
| Ce qui se gagne | Orange vif | Ambre `#B7772F` |
| Aide urgente | Rouge | Corail profond `#B9443C`, réservé à l'urgence |
| Signature | — | **Ligne d'horizon** : fin dégradé ambre → sauge sous le bloc principal et sous le nom « LIBRE » |
| Cartes | Verre translucide, ombres fortes | Surface pleine, filet fin `#E5DFD4`, ombre très douce, rayon 20 px |
| Bloc principal | Verre ou couleur vive | Encre profonde avec halo discret, chiffre géant, unité en serif italique |
| Barre d'onglets | Pilule flottante floutée | Barre ancrée en bas, pleine, filet supérieur, zone de sécurité respectée (comme une app native) |
| Anneau de progression | Rouge → jaune | Ambre → sauge |
| Décors | Pastilles en orbite, triple anneau | Retirés (aucune information) |
| Feuilles modales | Verre sur voile (gris) | Surface pleine à 97 % |
| Typographie | — | Titres serrés (−0,025 em), chiffres tabulaires, serif italique pour les mots qui comptent (prénom, raison, unité) |

Le style précédent n'est **pas supprimé** : Profil › Apparence › « Effets visuels » le réactive (verre, photo d'ambiance, animations).
Les couleurs d'accent (vert, lagon, indigo, corail) restent disponibles dans les deux styles.

Comparaisons : `docs/ux/transformation-*.jpg` ; nouveaux écrans : `docs/ux/nouveau-*.jpg`.

## 3. Fonctionnalités améliorées ou ajoutées

| Fonction | Ce qui change | Où |
|---|---|---|
| **Première ouverture** | Inscription raccourcie : prénom → habitudes → (objectif, durée, quantité, budget, dernière fois) → **difficultés** → **accompagnement** → raisons. Âge, sexe, taille, poids ne sont plus demandés | Inscription |
| **Objectif « Mieux comprendre »** | 3ᵉ objectif : noter et observer, sans limite ni compteur ; modifiable à tout moment (Habitudes › modifier) | Inscription, formulaire d'habitude |
| **Accueil en réduction / observation** | Plus de compteur « jours sans » : moyenne quotidienne sur 7 jours comparée à « avant » (seulement après 3 jours de suivi), jours dans la limite, ce qui reste aujourd'hui, total de la semaine et moment le plus fréquent | Accueil |
| **Accueil, ordre** | Bloc principal → **« J'ai une envie »** → **« Journée difficile ? »** → suivi du jour → semaine → raison → conseil adapté → aujourd'hui | Accueil |
| **Journée difficile** | Feuille : traverser une envie, écrire, parler à quelqu'un (proche ou lignes d'écoute), **alléger l'objectif du jour** (réversible), numéro d'urgence du pays ; proposée aussi après une humeur « très bas / bas » | Accueil |
| **Envies** | Bilan des 5 minutes : déclencheur et émotion facultatifs, enregistrés avec l'envie ; mention que l'effet varie selon les personnes | SOS |
| **SOS et numéros** | Groupés : danger immédiat / urgence médicale → crise → besoin de parler → soutien spécialisé ; « LIBRE n'est pas un service d'urgence » | SOS, Profil › Aide |
| **Suisse** | Ligne nationale jeu excessif **0800 040 080** (24 h/24, gratuite, anonyme) ; SafeZone.ch confirmé par l'OFSP | Table d'aide |
| **Personnalisation** | Les difficultés indiquées orientent les conseils tant que les données sont rares (« Parce que tu as indiqué que… ») ; réglage **« Conseils personnalisés »** désactivable ; les messages de sécurité restent toujours | Accueil, Profil › Apparence |
| **Messages** | Messages propres au mode observation (pas d'allusion à l'abstinence) | Accueil |

Inchangé volontairement (déjà solide, vérifié) : parcours après un écart (« Comprendre ce moment », ce qui a aidé, nouveau plan, jamais
de grand « 0 »), 5 minutes guidées, bibliothèque par addiction, statistiques, sauvegardes chiffrées, verrouillage, chiffrement natif.

## 4. Données et compatibilité

- Aucune donnée existante n'est supprimée. Les profils existants gardent âge/taille/poids s'ils en avaient.
- Nouveaux champs : `habits[].goal = 'comprendre'`, `tools.risks` (difficultés), `tools.easy` (objectif allégé du jour),
  `prefs.recs`, `prefs.look` (`horizon` | `verre`), `trigger`/`emotion` dans l'historique des envies. Format de sauvegarde inchangé (5).
- Une version **plus ancienne** de LIBRE qui lirait un objectif `comprendre` le traiterait comme « arrêter » ; le marqueur de compatibilité
  `dataV` la met déjà en lecture seule face à des données plus récentes.

## 5. Limites honnêtes

- Rien n'a été vu sur un vrai iPhone ou Android : rendu, gestes, VoiceOver, TalkBack, performances réelles.
- Le parcours de 5 minutes, la feuille « Journée difficile » et les textes des modes réduction/observation sont des **outils de soutien** :
  leur formulation doit être relue par un professionnel (`VALIDATION-MEDICALE.md`).
- Pas de test utilisateur réel (personnes en difficulté, après une rechute) : les « scénarios » A à H sont des tests automatisés qui
  vérifient le comportement, pas le ressenti.
- La bibliothèque et la frise « Mon corps » restent en anglais pour l'allemand, l'italien, l'espagnol et le portugais.
- Aucune IA externe n'est utilisée : la personnalisation est un ensemble de règles explicites, calculées sur l'appareil.

## 6. Tests

Voir `TESTS-FINAUX.md` (section « Transformation ») : 9 nouveaux tests (scénarios A, B, C, H, réduction, personnalisation, aide par
situation, apparence) ; les scénarios D (écart), E (statistiques), F (modifier un suivi), G (export / suppression) étaient déjà couverts
et repassent.
