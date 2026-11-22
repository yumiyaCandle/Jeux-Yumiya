# Refonte intégrale de LIBRE : rapport final

22 novembre 2026. Base : commit `6437887` (étiquette `avant-refonte-integrale`). Audit initial : `AUDIT-REFONTE.md`.
Captures avant/après : `docs/ux/refonte/` (comparaisons) et `docs/ux/avant-refonte/` (36 écrans d'origine).
Tout est implémenté dans le vrai projet et testé automatiquement dans Chromium ; **rien n'a été essayé sur un téléphone réel et l'app iOS
n'a jamais été compilée (pas de Mac).**

## 1. Rapport UX/UI final : comparaison avant / après

| Écran | Avant | Problème | Maintenant | Ce que l'utilisateur gagne |
|---|---|---|---|---|
| **Accueil (tableau de bord)** | Même page dans toutes les situations | En difficulté ou après une reprise, l'aide utile était sous la ligne de flottaison | **Carte de situation en tête**, une seule, la plus importante : moment difficile → reprise → premiers pas → objectif atteint ; rien quand tout va bien | L'aide adaptée est la première chose vue, sans chercher |
| Accueil · moment difficile | — | — | « On prend les choses une par une » : être guidé·e, pistes pour aujourd'hui, parler à quelqu'un | Trois actions, pas de liste à lire |
| Accueil · reprise | Lien dans le bloc principal | Peu visible | « Une reprise ne t'enlève rien » : comprendre ce moment, préparer la prochaine fois | Reprendre le fil sans culpabilité |
| Accueil · premiers pas | Rien | Une personne nouvelle ne savait pas quoi préparer | 4 tâches réelles (raison, proche, plan, essai de l'aide guidée), cochées automatiquement | LIBRE est prête le jour où l'envie arrive |
| Accueil · objectif atteint | « Toutes les étapes franchies » dans l'anneau | Aucune suite | Garder le cap : plan de maintien, nouvel objectif | Prévenir la rechute tardive |
| **SOS** | 10 choix d'emblée | Trop de décisions en pleine crise | Une action principale « Être guidé·e pas à pas », « Respirer avec moi » en un toucher, appel direct du proche, numéro d'urgence ; le reste replié | Moins d'effort cognitif au pire moment |
| **Aide guidée** | 4 phases fixes | Même exercice pour stress, ennui, solitude, pression sociale | 7 étapes : ressenti → intensité → contexte → **2 stratégies adaptées** (7 au choix) → exercice → bilan → enregistrement et suite | Un exercice qui correspond à la situation |
| Numéros d'aide | 4 groupes | La demande en distingue 6 | Danger immédiat · urgence médicale · crise psychologique · besoin de parler · soutien émotionnel · accompagnement professionnel | Le bon numéro, vite |
| **Après une reprise** | Formulaire | Les acquis n'étaient pas rappelés | « Ce qui reste acquis » en tête (jours sans au total, record, envies traversées) | Une reprise n'est plus vécue comme une remise à zéro |
| **Plans** | « Mon plan personnel » et « Mon plan anti-rechute » | Deux noms pour deux concepts proches, aucun modèle | « Mes plans pour les moments difficiles » + 5 modèles modifiables (envie, soirées, pression sociale, stress, après une période compliquée) | Un plan prêt en 30 secondes |
| **Profil** | 8 réglages au même niveau | Confidentialité difficile à repérer | 3 sections : Mon accompagnement · Confidentialité et données · Application | On trouve ses données et leur protection |
| **Bienvenue** | Description + 3 atouts sous la ligne de flottaison | On ne savait pas tout de suite pour qui ni pourquoi | 4 promesses visibles : pour qui, aide au bon moment, sans jugement, rien ne sort du téléphone | Comprendre LIBRE en 5 secondes |
| Inscription | Prénom sans mention de confidentialité | — | « Il reste sur ton appareil, comme tout ce que tu noteras » | Confiance dès la première question |
| Navigation | 5 onglets + SOS sur chaque écran | Déjà peu profonde | Conservée | — |
| Journal, statistiques, calendrier, bilans, bibliothèque, santé | — | Audités, sans défaut bloquant | Conservés (style Horizon) | — |

## 2. Fonctionnalités ajoutées ou modifiées

1. Accueil adaptatif (`homeSituation`, `situationCard`, `firstSteps`).
2. Aide immédiate en 7 étapes (`S5_STRATS`, `S5_MAP`, `s5Reco`) ; nouvelles phases : parler, ma réponse (phrases de refus), prendre soin de toi (liste à cocher).
3. Stratégie choisie enregistrée avec l'envie (`strat`), en plus du déclencheur et de l'émotion.
4. Modèles de plans par situation (`PLAN_TPL`), renommage « Mes plans pour les moments difficiles ».
5. Numéros d'aide en 6 rubriques.
6. Rappel des acquis dans le parcours après une reprise.
7. Profil en 3 sections ; « Conseils personnalisés » devient un réglage à part entière ; sous-titre Santé Apple exact (« Données reçues » / « Autorisation demandée… », plus de « Connecté » trompeur).
8. Bienvenue et première question réécrites.
9. Design system v2 : jetons d'espacement, de rayons et de typographie (`DESIGN-SYSTEM.md`).

Aucune fonctionnalité supprimée : les exercices existants restent accessibles (« Choisir moi-même un exercice »), l'ancien style reste en option.

## 3. Sécurité

Aucun mécanisme modifié (chiffrement, clés, verrouillage, sauvegardes, CSP, aperçus, rappels discrets). Nouvelles données :
stratégie choisie et plans issus de modèles, stockées dans le même état chiffré. Détail : `SECURITE-FINALE.md` § 7.

## 4. Tests

80 tests automatisés réussis sur 80 (Chromium), dont les 12 parcours demandés (`TESTS-FINAUX.md` § 6). Contrastes AA et zones tactiles
conformes. Android compilé ; iOS non compilé ; aucun appareil réel.

## 5. Ce qui n'est pas fait, honnêtement

- Pas de test avec de vraies personnes ; pas de VoiceOver/TalkBack réels.
- Bibliothèque : les fiches « rôle de l'entourage » et « retrouver confiance » restent à écrire avec des sources vérifiées et une relecture
  professionnelle ; la bibliothèque et la frise « Mon corps » restent en anglais pour DE/IT/ES/PT.
- Les textes de l'aide guidée (stratégies, phrases de refus, liste « prendre soin de toi ») sont des outils de soutien courants mais ne sont
  pas validés cliniquement (`VALIDATION-MEDICALE.md`).
- Les écrans journal, statistiques et bibliothèque n'ont pas été reconstruits : l'audit ne les a pas jugés défaillants.
