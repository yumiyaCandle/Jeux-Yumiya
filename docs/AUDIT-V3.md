# LIBRE version 3 : audit final, corrections et état avant publication

> **Document historique.** L’état à jour est dans `AUDIT-V4.md`.

Réalisé le 21 novembre 2026. Audit interne (pas une certification). Point de départ : le dépôt, commit `5c6935d`
(contenu identique à `livraison/LIBRE-projet-complet.zip` de la version 2). Le ZIP n'était pas joint au message ; j'ai donc
travaillé directement sur la source dont il est tiré. L'historique Git du dépôt permet de comparer chaque fichier avec `5c6935d`.

## 1. Les trois distributions

| Distribution | Source | Fichiers générés | Vérification ajoutée |
|---|---|---|---|
| Web hébergé et PWA | `libre/index.html`, `sw.js`, `manifest.webmanifest`, `privacy.html`, `photos/`, `fonts/`, `icons/` | — | Tests « PWA hors ligne », `VERSION` du service worker changée à chaque version |
| Fichier autonome | `libre/index.html` | `libre/LIBRE.html` par `tools/build-standalone.py` | `npm test` échoue si `LIBRE.html` n'est pas à jour |
| iOS et Android (Capacitor 8.6) | `libre/` copié par `libre-app/scripts/sync-web.mjs` | `ios/App/App/public`, `android/app/src/main/assets/public`, `capacitor.config.json` copiés | Comparaison octet par octet après `npx cap sync` (identiques) ; configuration générée relue |

## 2. État initial (rapport de la phase 1)

Gravité : **C** critique, **I** important, **M** modéré, **F** amélioration facultative.

| Domaine | État constaté | Problème | Gravité | Action |
|---|---|---|---|---|
| Tests | 43 tests Playwright | Playwright non déclaré : impossible à lancer depuis un dossier vierge | I | `package.json` racine (Playwright 1.63.0), `npm ci`, `npm test`, code d'erreur vérifié |
| Sécurité, natif | Coffre AES-256-GCM correct | `loggingBehavior: "debug"` : l'état complet en clair dans les journaux système des versions de développement | **C** | `"none"` |
| Sécurité, natif | — | Erreur passagère du trousseau ou du Keystore traitée comme un coffre illisible : app vide, données mises de côté | **C** | Erreurs `UNAVAILABLE` / `UNREADABLE`, écran « Réessayer » |
| Stockage web | Chiffrement facultatif | Pas de changement de mot de passe ; risque d'écriture concurrente pendant un changement de clé | I | Changement de mot de passe, écritures suspendues pendant les changements de clé |
| Compatibilité | — | Une ancienne version en cache pouvait écrire par-dessus des données plus récentes | I | Marqueur `dataV`, lecture seule |
| Site | Page soignée | « Tout reste sur ton téléphone, chiffré » : faux pour le web sans option | I | Texte exact, fr et en |
| iOS, Santé | Lecture seule | Description iOS incomplète (variabilité, fréquence respiratoire) ; clé d'écriture inutile ; texte seulement en français | M | Description identique à la politique, 6 langues, clé retirée |
| Traductions | 6 complètes, 14 partielles | Les 14 partielles mélangeaient leur langue et l'anglais (arabe compris) | I | Lancement en 6 langues (ton choix), rien supprimé, fichiers pour traducteurs |
| Accessibilité | Bon niveau (tests) | Texte à 200 % : 5 écrans débordaient ; jours du calendrier et « aujourd'hui » repérables seulement par la couleur | I | Grilles qui se resserrent, hachures, libellé en gras ; test 200 % ajouté |
| Interface | Cohérente | « 12 mois » coupé à 320-375 px ; matière des feuilles incohérente ; journal : 3 lignes de filtres ; un retour haptique manquant (faute de nom) | M | Corrigés, test des barres d'onglets dans 6 langues |
| Journal | Complet | Texte perdu si la fenêtre se fermait par accident | M | Brouillon gardé en mémoire |
| Performances | Bonnes | Calcul des « jours sans » en O(jours × consommations) | M | Une seule lecture des consommations |
| Code | — | Deux anciennes listes de numéros d'aide inutilisées | F | Retirées |
| Contenu médical | Prudent, sourcé | Jamais relu par un professionnel ; liens non vérifiables ici | I | `VALIDATION-MEDICALE.md`, `tools/check-sources.py` |
| Numéros d'aide | Par pays | 66 lignes sans date de vérification documentée | I | `RESSOURCES-AIDE.md` |
| Documentation | Abondante | Mentions de Capacitor 7, « 19 langues », remarque sur le ZIP d'une version précédente | M | Documents historiques marqués, documents à jour réécrits |
| Publication | Préparée | Informations légales manquantes (normal), comptes à créer | I | `ACTIONS-RESTANTES.md` |

## 3. Corrections et améliorations réalisées

### Sécurité et données
- Journalisation Capacitor coupée (`loggingBehavior: "none"`), vérifiée dans les deux configurations générées.
- Coffre natif : erreurs passagères distinguées des erreurs définitives (Swift et Java) ; écran d'attente ; migration relue ; rien n'est écrit en clair.
- Web chiffré : changement de mot de passe ; file d'écriture suspendue pendant les changements de clé ; deux onglets testés.
- Marqueur de compatibilité des données `dataV` (lecture seule si les données viennent d'une version plus récente).
- Brouillon du journal, en mémoire seulement.
- Santé Apple : description iOS exacte et traduite, clé d'écriture retirée (LIBRE n'écrit rien).

### Fiabilité
- Calcul des jours calendaires réécrit (même résultat, une seule lecture des consommations) ; test sur 4 fuseaux horaires, jours de
  23 et 25 heures, 29 février.

### Interface (Apple Design et 21st.dev, voir `DESIGN-SYSTEM.md`)
- Libellés courts des périodes sur petit écran (« 7 j, 30 j, 3 m, 12 m »), libellé complet pour les lecteurs d'écran.
- Feuilles : matière plus dense, en-tête de même matière avec flou au lieu d'une bande opaque d'une autre teinte.
- Journal : filtres sur une seule ligne qui défile.
- Retour haptique rétabli à l'enregistrement d'une habitude.
- Calendrier hachuré pour les jours avec consommation ; « aujourd'hui » en gras souligné dans les graphiques.
- Texte agrandi à 200 % : aucun écran ne déborde (fr et de).

### Fonctions
- Biométrie : code natif Android (compilé) et iOS (non compilé), interface prête, **option cachée** (ton choix) jusqu'aux essais.
- Langues : lancement en 6 langues (ton choix) ; les 14 autres restent dans le code ; `tools/i18n.py` (audit et export).

### Contenu
- Site de présentation : texte sur le chiffrement corrigé ; métadonnées de partage. Il dit « Bientôt sur l'App Store et Google Play ».
- Liste des contenus à valider, tableau des ressources d'aide, script de vérification des liens.

### Outils et documentation
- `package.json` racine, `npm test`, `tools/build-standalone.py --check`, `tools/i18n.py`, `tools/check-sources.py`.
- Nouveaux documents : `SECURITE.md`, `TESTS.md`, `DESIGN-SYSTEM.md`, `LANGUES.md`, `BIOMETRIE.md`, `VALIDATION-MEDICALE.md`,
  `RESSOURCES-AIDE.md` ; `ACTIONS-RESTANTES.md`, `ARCHITECTURE.md`, `PUBLICATION.md`, `TESTS-APPAREILS.md` mis à jour.

### Supprimé
- Deux listes de numéros d'aide jamais utilisées par le code (`HELPLINES`, `HELPLINES_CH`) : la table par pays `HELP` les remplace.
- La clé iOS `NSHealthUpdateUsageDescription` : LIBRE n'écrit rien dans Santé.
- Aucune fonctionnalité supprimée. Les 14 langues partielles ne sont plus proposées mais restent dans le code.

### Conservé tel quel (déjà bon)
Feuilles à ressort et geste de fermeture, SOS guidé, exercices, statistiques et bilans, sauvegardes chiffrées, verrouillage par code,
rappels discrets, contenus de santé prudents et sourcés, numéros d'aide par pays, chiffrement natif.

## 4. Mesures

Voir `tests/RESULTATS.md` (dernière exécution complète). Sur processeur ralenti 4 fois (téléphone modeste simulé), avec 12 000
consommations et 5 000 entrées de journal (2,9 Mo une fois chiffrées), sur deux exécutions : démarrage 1,8 s ; écrans principaux
de 0,2 à 1,5 s ; ouverture des données chiffrées 1,1 à 1,5 s (dont 600 000 itérations PBKDF2, voulues) ; enregistrement d'une
entrée chiffrée 0,8 à 1,6 s (tout l'état est rechiffré à chaque écriture). Sans ralentissement, chaque écran s'affiche en moins de 0,5 s.
Amélioration possible si de très gros journaux deviennent courants : chiffrer le journal à part pour ne rechiffrer que ce qui change.

## 5. Ce qui n'a pas pu être vérifié

Compilation iOS ; tout essai sur iPhone ou Android réel ; VoiceOver et TalkBack réels ; liens des sources et numéros d'aide
(réseau bloqué dans mon environnement) ; Safari et Firefox. Détail dans `TESTS.md`.

## 6. Pistes de la partie 14 : évaluation

Utilité et difficulté sur 5 ; risque principal.

| Piste | Utilité | Difficulté | Risque | Décision |
|---|---|---|---|---|
| A. Bilan quotidien (humeur, envie, difficulté, réussite, objectif) | 4 | — | — | **Existe déjà** : « Aujourd'hui » (humeur du jour, petit objectif) et journal (envie, difficultés, réussites). Pas de second système |
| B. Préparer une situation difficile (soirée, stress, personnes) | 4 | 3 | Doublon avec le plan | **Existe en grande partie** : plans « si… alors… » par situation. À enrichir plus tard de modèles prêts à l'emploi |
| C. Bilan hebdomadaire ou mensuel | 4 | — | — | **Existe** (bilan de la semaine, bilan mensuel imprimable), non culpabilisant |
| D. Ressources locales | 5 | 2 | Numéros faux | **Existe** (34 pays) ; la vérification annuelle est le vrai travail (`RESSOURCES-AIDE.md`) |
| E. Favoris | 3 | — | — | **Fait** en version 2 (exercices) |
| F. Export d'un résumé choisi sans le journal | 3 | 2 | Partage involontaire | **Existe** : le bilan mensuel imprimable indique seulement le nombre d’entrées du journal, jamais leur texte |
| G. Biométrie | 4 | 3 | Code non essayé | **Écrite, cachée** jusqu'aux essais |
| H. Rappels plus fins | 3 | 2 | Notifications intrusives | Déjà réglables un par un (jours, heure, pause, période calme). Piste suivante : rappel 15 min avant l'heure habituelle des envies (`AMELIORATIONS.md` n° 4) |

## 7. Critères de qualité (partie 17) : évaluation honnête

| Domaine | Objectif | État | Ce qu'il manque |
|---|---|---|---|
| Design, ergonomie, navigation | 10/10 | Cohérent, système documenté, contrôlé à 320-1280 px et en 6 langues | Un regard extérieur et des essais avec des personnes concernées : je ne peux pas attribuer de note juste à mon propre travail |
| Fonctionnalités | 10/10 | Complètes pour l'accompagnement ; rien de factice | Biométrie à activer après essais |
| Fiabilité des données | 10/10 | Écritures atomiques, copies de sécurité, compatibilité, tests de corruption, de concurrence et de calendrier | Essais sur appareils réels (redémarrage, mise à jour de l'app) |
| Sécurité, confidentialité | Maximum raisonnable | Chiffrement natif, option web, aucune donnée transmise, aucun journal | Audit externe ; web non chiffré par défaut (choix assumé et affiché) |
| Accessibilité WCAG 2.2 AA | Visée | Noms accessibles, cibles, contrastes, 200 %, mouvement réduit, couleur jamais seule | VoiceOver et TalkBack réels |
| Performances | Excellentes sur appareil modeste | Mesurées en simulation (processeur 4 fois plus lent) | Mesure sur un vrai téléphone d'entrée de gamme |
| Traductions | Aucun mélange dans les langues complètes | 0 texte manquant dans l'interface des 6 langues | Contenus longs en anglais pour de, it, es, pt (signalé dans l'app) |
| Web, PWA | Vérifiées | Tests automatisés réussis | Safari et Firefox |
| iOS | Selon moyens | Projet cohérent, relu par un analyseur | **Jamais compilé** |
| Android | Selon moyens | Compilé, tests unitaires réussis, APK de test | Jamais installé sur un téléphone |
| Publication | Prérequis identifiés | `PUBLICATION.md`, `ACTIONS-RESTANTES.md` | Tes informations légales, comptes, signatures, validation médicale |
