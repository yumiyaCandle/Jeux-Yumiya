# LIBRE : audit et refonte du 21 novembre 2026

Ce document complète `AUDIT.md` (premier audit : PIN, sauvegardes chiffrées, coffre natif, projets iOS et Android).
Il couvre la mission « audit, refonte et optimisation professionnelle ».

## 0. Point de départ et sauvegarde

- Aucun fichier ZIP n'était joint à la demande. Le travail porte sur la dernière version du dépôt, qui est celle des archives de `livraison/`.
- **Version d'origine conservée** : commit `3ca9e12` de la branche `claude/libre-photography-visual-identity-3h9i40`. Chaque modification est
  un commit séparé ; `git diff 3ca9e12` montre tout ce qui a changé.
- La mention `PWA_BUILD=false` de la demande vient du fichier autonome `LIBRE.html` (voir § 7) : dans `index.html`, la valeur est `true`.

## 1. Diagnostic

| Domaine | État constaté | Décision |
|---|---|---|
| Suivi des habitudes (création, réglages, date de début, objectif arrêt ou réduction, consommation d'avant, pause et reprise, plusieurs suivis) | Fonctionne, testé | Conservé |
| Consommations | Ajout, suppression et annulation fonctionnent. **Impossible de corriger une consommation passée** : il fallait la supprimer et la ressaisir | **Ajouté : modifier** (quantité, heure, contexte, commentaire) |
| Suppression d'un suivi | Efface les consommations liées **sans copie de sécurité**, alors que l'effacement du journal en a une | **Corrigé** : copie de sécurité, retour possible depuis Profil |
| Calculs des jours | Compteur = temps réel écoulé depuis la dernière consommation (périodes de 24 h) ; jours calendaires via `setDate`/`setHours` en heure locale : années bissextiles et changements d'heure corrects | Conservé. Limite : un jour de changement d'heure dure 23 ou 25 h, le compteur « jours » peut basculer une heure plus tôt ou plus tard |
| Après un écart | Le grand chiffre montre le total des jours sans (cycle précédent) | Conservé |
| Statistiques | 7 j, 30 j, 3 mois, 12 mois, comparaison avec la période d'avant, bilans hebdomadaire et mensuel, graphiques à parcourir au doigt | Conservé |
| Économies | Calculées depuis la quantité et le budget saisis ; l'écran d'accueil disait « calculé automatiquement » | **Texte corrigé** : « une estimation, à partir de ce que tu dépensais avant » |
| Journal | Ajout, suppression confirmée, recherche, filtres réussites/difficultés/envies fortes, pagination | **Ajouté** : modifier une entrée, filtres « humeur basse », « bonne humeur » et par mois |
| Envies et SOS | Bouton « J'ai une envie » sur l'accueil et dans Outils, SOS guidé 5 min (respiration, minuteur, vague, raisons, plan, proches, numéros d'aide du pays) | Conservé |
| Exercices | 8 exercices avec durée, description et sources | **Ajouté : favoris** (étoile, section « Mes favoris » en haut d'Outils). Mise en page corrigée sur petit écran |
| Petites missions du jour | Existent déjà : « Petit objectif » du jour, facultatif, cochable, lié à un outil | Conservé, pas de doublon |
| Version web : stockage | `localStorage` en clair (dit clairement dans l'app) | **Ajouté : chiffrement facultatif par mot de passe** (§ 3) |
| « Copier en texte » | Copie toutes les données en clair, sans avertissement | **Avertissement ajouté** ; l'export chiffré est proposé |
| Aide « nouvel appareil » | Disait que le fichier « n'est pas chiffré », alors qu'il l'est par défaut | **Corrigé** |
| Écran de bienvenue | Ne citait que 5 substances (LIBRE en suit 20) ; ne disait pas que l'app s'adresse aux adultes | **Corrigé**, en 19 langues |
| Langues | fr, en, de, it, es, pt : complètes (0 texte manquant). 13 autres : interface en anglais, textes de sécurité traduits, signalées « Partielle » | Voir § 5 |
| Natif (Capacitor, LibreVault, LibreHealth, rappels) | Audité au premier audit ; inchangé ici. Android compilé et testé (tests unitaires du coffre) | Voir § 6 |

## 2. Bugs corrigés

1. **Suppression d'un suivi irréversible** : maintenant précédée d'une copie de sécurité, et le message le dit.
2. **Marqueur d'écran resté sur « verrouillé »** après « Code oublié » : l'inscription s'affichait sous un écran marqué `lock`. Corrigé.
3. **Débordement horizontal en allemand** (Profil › Rappels, 360 px) : la ligne « Tägliche Erinnerung » + heure + interrupteur dépassait. Corrigé (coupure des mots longs, champ heure à largeur fixe).
4. **Texte des exercices écrasé** sur petit écran (durée + étoile à droite) : la durée passe sous la description.
5. **Textes inexacts** : fichier « non chiffré », économies « calculées », 5 substances seulement (§ 1).

## 3. Sécurité et confidentialité

### Chiffrement facultatif de la version web (nouveau)
- **Où** : Profil › Tes données › « Chiffrer mes données sur ce navigateur ». Désactivé par défaut ; proposé seulement dans un navigateur
  (dans les apps, le coffre natif chiffre déjà tout).
- **Comment** : AES-256-GCM ; clé dérivée du mot de passe par PBKDF2-SHA-256 (600 000 itérations, sel aléatoire de 16 octets) ; IV aléatoire
  de 12 octets à chaque écriture. Les données **et** la copie de sécurité sont chiffrées. Le mot de passe n'est jamais enregistré ; la clé reste
  en mémoire et n'est pas exportable.
- **Sûreté des données** : à l'activation, le texte chiffré est relu et comparé avant de remplacer la version en clair. Tant que le mot de passe
  n'est pas saisi, rien n'est affiché et rien ne peut être écrit par-dessus. Un mauvais mot de passe ne modifie rien. « Mot de passe oublié »
  repart de zéro mais **conserve la version chiffrée à part** (`libre.v1.chiffre.<date>`), jamais effacée. Plusieurs onglets ouverts : chaque
  onglet relit la version chiffrée au lieu de l'écraser.
- **Après 5 minutes en arrière-plan**, la page se recharge et redemande le mot de passe (la clé quitte la mémoire).
- **Limites, dites dans l'app et ici** : aucune récupération possible ; pendant que LIBRE est ouverte, la clé est en mémoire (un logiciel
  malveillant sur l'ordinateur pourrait la lire) ; la langue choisie reste en clair (elle ne révèle rien d'intime). Le verrouillage par code
  reste présenté comme un masquage, pas comme un chiffrement.
- Testé : aucune donnée lisible dans le stockage (nom, journal, nouvelle entrée), écran de mot de passe infranchissable par la navigation,
  mauvais mot de passe refusé sans dommage, désactivation avec mot de passe, oubli sans perte (§ tests).

### Inchangé et revérifié par les tests
PIN (PBKDF2 600 000, délais persistants), sauvegardes chiffrées (format 5, refus des formats futurs, fichiers corrompus ou hostiles),
copie de sécurité avant restauration, effacement complet, aucune requête réseau automatique, notifications neutres par défaut.

### Non fait
- **Verrouillage biométrique** (Face ID, empreinte) : demande un module natif (LocalAuthentication sur iOS, BiometricPrompt sur Android).
  Je ne l'ai pas ajouté : il ne peut pas être essayé ici (pas d'iPhone, pas d'émulateur Android), et une fausse intégration est exclue.
  Ce qu'il faut développer est décrit dans `ACTIONS-RESTANTES.md`.

## 4. Fonctionnalités ajoutées (toutes testées)

| Ajout | Où |
|---|---|
| Modifier une consommation passée (annulable) | Habitudes › détails d'une habitude › crayon |
| Modifier une entrée du journal (la date d'origine est conservée) | Journal › crayon |
| Filtres du journal : humeur basse, bonne humeur, par mois | Journal |
| Exercices favoris | Outils › étoile |
| Chiffrement facultatif des données web | Profil › Tes données |
| Copie de sécurité avant la suppression d'un suivi | Habitudes › Modifier › Supprimer |

Rien n'a été supprimé.

## 5. Langues

- fr, en, de, it, es, pt : 0 texte manquant (audit automatique), y compris tous les textes de cette refonte.
- ar, da, hi, id, ja, ko, nb, nl, pl, ru, sv, tr, vi, zh : **826 textes chacune restent en anglais**. L'app le dit (« Partielle ») et les textes
  de sécurité sont traduits. En arabe, l'interface est en sens droite-à-gauche avec des passages en anglais. Les traduire correctement demande
  des traducteurs (environ 11 000 textes au total), pas une traduction automatique non relue. J'ai traduit dans ces 14 langues les textes
  modifiés de l'écran de bienvenue, de la suppression d'un suivi et de la restauration, pour qu'ils ne régressent pas.
- Vérifié visuellement à 360 px en arabe et en allemand (Accueil, Outils, Profil) ; le test « aucun débordement » couvre 320 à 1280 px.

## 6. Natif, PWA et architecture

- **Trois distributions, un seul code** (`libre/index.html`) :
  - **web hébergé / PWA** (`PWA_BUILD=true`) : service worker `sw.js` (cache versionné, mise à jour au rechargement), manifeste, icônes ;
    fonctionne hors ligne (testé).
  - **fichier autonome `LIBRE.html`** (`PWA_BUILD=false`) : photos et police incluses ; pas de service worker, car un fichier ouvert
    directement ne peut pas en avoir. Il est maintenant fabriqué par `tools/build-standalone.py` (le script était hors du dépôt).
  - **apps iOS et Android** (`libre-app/`, Capacitor 8) : le service worker est désactivé automatiquement ; coffre chiffré natif.
- **Taille** : 2,2 Mo, dont l'essentiel est fait des traductions (19 langues) et des contenus sourcés. Le découpage en modules a été étudié et
  **pas fait** : il ajouterait une étape de compilation et des risques de régression pour un gain de démarrage faible (le test de performance
  affiche chaque écran en moins de 1,5 s avec 3 ans d'historique). C'est à faire seulement avec un outil de build dédié.
- **Android** : compilé (`assembleDebug`) et tests unitaires du coffre réussis. **iOS** : non compilé ici (Xcode 26 nécessaire, sur Mac).
- **Santé Apple** : intégration réelle (HealthKit, lecture seule, déconnexion qui efface les copies locales), proposée seulement sur iPhone.
  Rien n'est proposé sur Android ni sur le web. Health Connect (Android) n'a pas été ajouté : aucune fonction de LIBRE n'en a besoin
  aujourd'hui, et il impose une déclaration supplémentaire sur Google Play.

## 7. Contenu médical

Les contenus existants restent sourcés et datés (page « Quand consulter », avertissements sur l'arrêt brutal de l'alcool, des
benzodiazépines et des opioïdes, numéros d'aide par pays). Cette refonte n'a ajouté **aucun** contenu médical. **Une relecture par un
professionnel de santé reste indispensable avant publication** ; je ne peux pas la remplacer.

## 8. Fichiers modifiés

`libre/index.html`, `libre/privacy.html`, `libre/sw.js`, `libre/LIBRE.html` (fabriqué), `tools/build-standalone.py` (nouveau),
`tests/suite.js`, `tests/RESULTATS.md`, `docs/AUDIT-REFONTE.md`, `docs/TESTS-REFONTE.md`, `docs/ACTIONS-RESTANTES.md`,
`docs/ARCHITECTURE.md`, `docs/README.md`, `livraison/*`.
