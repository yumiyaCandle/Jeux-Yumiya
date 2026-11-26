# LIBRE 12 « Jour et nuit »

Date : 26 novembre 2026. Compétences trouvées avec /find-skills (le catalogue skills.sh étant injoignable depuis
l'environnement, les sources qu'il recommande ont été consultées directement sur GitHub et lues avant installation) :
**frontend-design** (anthropics/skills, Apache 2.0) et **web-design-guidelines** (vercel-labs/agent-skills, MIT).

## Thème adaptatif (Profil › Mes addictions › Thème)

- Comme le téléphone (par défaut), Jour, Nuit, ou **Selon l'heure** : jour de 7 h à 20 h, nuit le reste du temps ;
  la plage est modifiable. Le passage se fait tout seul, vérifié chaque minute.
- Jour : un blanc lumineux légèrement bleuté remplace le crème (frontend-design signale le fond crème comme l'un
  des looks les plus typiques des interfaces générées). Nuit : bleu nuit profond, inchangé.

## Nouvelles fonctions (toutes sur l'appareil, sans Internet)

| Fonction | Où | Pourquoi |
|---|---|---|
| Rappels du Jour J | Notification la veille à 19 h et le jour J à 8 h (app iPhone/Android) ; rappel sur l'accueil la veille et le jour même (partout, y compris dans le navigateur) | Se préparer et ne pas être pris de court |
| Signaux d'alerte | Mon plan (9 propositions + les siens), rappelés dans l'Aide | Prévention de la rechute : repérer tôt les signes qui annoncent une reprise |
| Objectif d'épargne | Progrès | Donner un but concret à l'argent économisé ; progression calculée sur les vraies économies |

Données : dans le plan (`plan.signs`, `plan.goalSave`, `plan.quit`), vérifiées à la lecture ; anciennes sauvegardes
compatibles.

## Revue web-design-guidelines

Corrigé : sauts de titres h1 → h3 (Progrès, Ce qui m'aide, Mes raisons, Économies), ligne de notification cliquable
non accessible au clavier, lien « Aller au contenu », dimensions des photos de motivation, `touch-action: manipulation`,
titres équilibrés. Déjà conformes : zoom jamais bloqué, aucune `transition: all`, focus visible, `aria-live` sur les
messages, `overscroll-behavior: contain` sur les fenêtres.

## Tests

113/113 (4 nouveaux tests « LIBRE 12 »), contrastes AA en clair et en sombre, zones tactiles ≥ 24 px, 6 langues complètes.
