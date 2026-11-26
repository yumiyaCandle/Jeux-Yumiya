# Tests finaux de LIBRE

22 novembre 2026. Environnement : Linux, Node 22, Playwright 1.63.0 + Chromium, JDK 21, SDK Android ; **pas de Mac, pas de téléphone,
pas d'émulateur**. Détail test par test : `TESTS.md` (généré) et `tests/RESULTATS.md` (écrit par le lanceur lui-même).

## 1. Classement

| Statut | Nombre | Contenu |
|---|---|---|
| **Réussi réellement** | 64 tests web + 12 tests JUnit + 3 contrôles + 3 compilations | Comportement de l'app dans Chromium (web, PWA, `LIBRE.html`), format chiffré du coffre Android sur la JVM, contrastes, zones tactiles, versions ; `assembleDebug`, `assembleRelease`, `bundleRelease` ; lint (0 erreur) ; `npm audit` (0 vulnérabilité) |
| **Simulé** | 11 tests web | Logique de LIBRE avec des plugins natifs **factices** (coffre, rappels, Santé Apple, partage, fichiers). Prouve que LIBRE appelle correctement les plugins ; **ne prouve pas** que les plugins natifs fonctionnent sur un téléphone |
| **Échoué** | 0 | — |
| **Non exécuté** | — | Compilation iOS ; toute exécution sur iPhone ou Android ; intégration continue GitHub (workflow jamais lancé) ; vérification des 82 liens de sources (réseau bloqué) ; appels réels aux numéros d'aide ; VoiceOver et TalkBack réels |

## 2. Commandes exécutées (et résultat réel)

| Commande | Résultat |
|---|---|
| `npm test` (langues, `LIBRE.html` à jour, 75 tests Playwright) | 75 réussis, 0 échoué |
| `npm run check:contrast` | Aucun texte mesurable sous le seuil AA (clair et sombre) |
| `npm run check:targets` | Toutes les cibles ≥ 24 × 24 px |
| `npm run check:versions` | 1.0.0 / build 1 sur Android, iOS, `package.json` ; copies natives et `LIBRE.html` à jour |
| `npm audit --audit-level=high` (racine et `libre-app`) | 0 vulnérabilité |
| `./gradlew assembleDebug assembleRelease bundleRelease :app:testDebugUnitTest lintRelease` | Réussi ; 12 tests JUnit ; lint : 0 erreur, 29 avertissements |
| Extraction de `LIBRE-COMPLET.zip` dans un dossier vierge, puis `npm ci`, `npm test`, `npm run sync`, `gradlew assembleDebug bundleRelease :app:testDebugUnitTest` | Réussi : archive intègre, aucun fichier de clé ou de secret, 75 tests réussis, contrastes et cibles conformes, versions cohérentes, compilation Android et 12 tests JUnit réussis |

## 3. Tests ajoutés dans cette version (non-régression)

| Test | Protège contre |
|---|---|
| Sécurité · Politique de sécurité (CSP) | Une régression qui réintroduirait une connexion externe ou casserait l'app sous CSP |
| Aide · Jeux d'argent | Ligne spécialisée absente, ou affichée à tort à tout le monde |
| Sécurité santé · Avertissement de sevrage | Disparition de l'avertissement « le sevrage peut être dangereux » pour l'alcool |
| Contrôles `check:contrast`, `check:targets`, `check:versions` | Régression de contraste, de taille de cible, ou versions désynchronisées |

## 4. À faire sur appareils réels

`TESTS-APPAREILS.md` : plan complet (iPhone Face ID et Touch ID, Android récent et ancien), dont les ajouts de cette version :
CSP dans les WebView, rangée d'urgence du SOS (appel direct), feuilles modales opaques, zones tactiles des liens.

## 5. Transformation « Horizon » (22 novembre 2026)

Nouveaux tests (Playwright, Chromium ; plugins natifs simulés pour le scénario H) :

| Test | Vérifie |
|---|---|
| Scénario A · Découverte | Objectif « mieux comprendre », difficultés, rappels refusés ; aucune question sur le corps ; accueil sans compteur d'abstinence ; conseil « Parce que tu as indiqué… » |
| Suivi · Réduction | Moyenne sur 7 jours, « Avant : 4 verres par jour », « Il te reste 1 verre », jamais « jours sans » |
| Scénario B · Envie forte | 5 minutes guidées, déclencheur et émotion enregistrés avec l'envie |
| Scénario C · Journée difficile | Feuille, numéro d'urgence du pays, objectif allégé puis rétabli |
| Personnalisation | Conseils désactivables ; message de sécurité alcool toujours affiché |
| Aide | Numéros groupés par situation ; « LIBRE n'est pas un service d'urgence » ; Suisse 0800 040 080 |
| Scénario H · Permission refusée | Notifications refusées : rien de programmé, message clair, app utilisable |
| Apparence · Horizon | Horizon par défaut même pour un profil existant ; option « verre » conservée après rechargement |

Tests existants adaptés (comportement voulu changé) : « Réglage d'apparence » (on active maintenant le verre au lieu de le couper),
« Animations » (exécuté avec l'option « verre », seule à animer l'ouverture).
Scénarios D (écart), E (statistiques), F (modifier un suivi), G (export / suppression) : tests existants, repassés.
Défaut trouvé par les tests et corrigé : étape d'inscription sautée sur double appui (avancement automatique).

## 6. Refonte intégrale : les 12 parcours demandés

Tous **réussis réellement dans Chromium** (Playwright) ; « simulé » = plugins natifs factices ; aucun n'a été exécuté sur téléphone.

| # | Parcours | Test(s) | Nature |
|---|---|---|---|
| 1 | Nouvel utilisateur, configuration | Parcours 1 · Découverte ; Inscription | Web |
| 2 | Tableau de bord | Parcours 2 · Tableau de bord adaptatif (5 états) | Web |
| 3 | Envie, aide immédiate | Parcours 3 · aide guidée en 7 étapes | Web |
| 4 | Exercice guidé | Parcours 4 · Surfer sur l'envie | Web |
| 5 | Journée difficile | Parcours 5 · Journée difficile | Web |
| 6 | Rechute | Parcours 6 · Rechute ; Après un écart | Web |
| 7 | Statistiques | Statistiques · graphiques, périodes, bilans (tests existants) | Web |
| 8 | Modifier ses objectifs | Parcours 8 · arrêter → mieux comprendre ; Modifier puis supprimer un suivi | Web |
| 9 | Espace SOS | Aide · 6 rubriques, Suisse ; Pays absent de la table | Web |
| 10 | Export / suppression | Sauvegarde · export chiffré, restauration ; Tout effacer | Web |
| 11 | Permission révoquée | Parcours 11 · notifications refusées ; Santé Apple · états exacts | **Simulé** |
| 12 | Après une mise à jour | Migration · état v3 ; Données d'une version plus récente ; Apparence · Horizon pour profil existant | Web |

Plus : Plans · modèle « Pression sociale ». Total : **80 réussis, 0 échoué**.

## 7. Refonte « Clairière » (22 novembre 2026)

Exécutés réellement dans Chromium (Playwright) : **84 réussis, 0 échoué**.

| Nouveau test | Ce qui est vérifié |
|---|---|
| Navigation | Sur 5 écrans : la barre est Accueil · Habitudes · **Aide** · Progrès · Outils ; le bouton Aide ouvre l'aide immédiate ; l'avatar ouvre le profil |
| Journal · écriture guidée | Question suivante, réponse à la question, émotions, humeur, intention : enregistrées, réaffichées, regroupées sous « Aujourd'hui », humeur visible sur la semaine |
| Statistiques · lecture expliquée | Constats (tendance, déclencheur), « Comment c'est calculé » sur chacun, mention « pas un diagnostic » ; rien de conclu avec 2 jours de suivi |
| Bibliothèque · thèmes | 11 thèmes, objectif pédagogique, au moins une fiche par thème, thème « entourage » signalé « en préparation », une fiche s'ouvre avec ses sources |

Adaptés à l'interface (pas aux résultats) : filtres du journal ouverts depuis « Filtrer » ; robot d'inscription tolérant au passage
automatique à l'étape suivante. Contrastes AA, zones tactiles, texte 200 % (fr, de) : conformes. Android : `assembleDebug
assembleRelease bundleRelease :app:testDebugUnitTest lintRelease` réussi, 12 tests JUnit, 0 erreur de lint. iOS : non compilé.
Appareils réels : aucun.

Vérification de l'archive : `LIBRE-COMPLET.zip` extraite dans un dossier vierge, puis `npm ci`, `npm test` (84 réussis),
contrastes et cibles conformes, `libre-app` : `npm ci`, `npm run sync`, `gradlew assembleDebug bundleRelease :app:testDebugUnitTest`
réussi. Aucun fichier de clé ni secret dans l'archive.

## 8. Reconstruction « Envol » (22 novembre 2026)

Exécutés réellement dans Chromium : **87 réussis, 0 échoué**. Nouveaux : triage de l'aide (4 besoins, chacun vers le bon outil, appel
du proche, numéros d'urgence) ; moment à risque (affiché avec son explication, absent si les conseils sont désactivés) ; ressources
(4 exercices immédiats, espace en tuiles). Mis à jour : barre de navigation (Aujourd'hui · Suivi · Aide · Journal · Ressources).
Défauts trouvés par les tests et corrigés dans l'app : graphique masqué par la barre flottante, onglets du Suivi coupés à 320 px,
grilles débordant à 200 %, un contraste insuffisant en mode sombre (journal). Android : compilation, 12 tests JUnit, 0 erreur de lint.
iOS : non compilé. Appareils réels : aucun.

Vérification de l’archive `LIBRE-COMPLET.zip`, extraite dans un dossier vierge : `npm ci`, `npm test` (87 réussis), contrastes conformes,
`libre-app` : `npm ci`, `npm run sync`, `gradlew assembleDebug bundleRelease :app:testDebugUnitTest` réussi ; aucun fichier de clé ni secret.

## 9. Refonte « Encre » (22 novembre 2026)

Exécutés réellement dans Chromium : **87 réussis, 0 échoué**. Nouveau test « Soutien » (7 situations, 3 gestes, plan prérempli depuis
la fiche, lien vers le thème de la bibliothèque, accès au danger). Mis à jour : navigation (Aujourd'hui · Soutien · Progrès · Journal,
bouton Aide dans l'en-tête), triage de l'aide. Contrastes AA, zones tactiles, texte 200 % : conformes après corrections (en-tête et
bibliothèque à 200 % en allemand, onglets de période trop étroits). Android : compilation, 12 tests JUnit, 0 erreur de lint.
iOS : non compilé. Appareils réels : aucun.

Vérification de l’archive `LIBRE-COMPLET.zip` extraite dans un dossier vierge : `npm ci`, `npm test` (87 réussis), contrastes
conformes ; `libre-app` : `npm ci`, `npm run sync`, `gradlew assembleDebug bundleRelease :app:testDebugUnitTest` réussi ; aucun fichier de clé ni secret.

## 10. Finition « Encre »

Exécutés réellement dans Chromium : **88 réussis, 0 échoué** (nouveau : fiche interactive, « Ce qui t'aide », lien depuis une
reprise ; navigation mise à jour : « Progrès » ouvre les statistiques). Revue visuelle à 393 × 852 et 375 × 667 (simulation de taille,
pas un iPhone réel). Contrastes, zones tactiles, texte 200 % : conformes. Android : compilation, 12 tests JUnit, 0 erreur de lint.

## 11. Refonte « Souffle »

Exécutés réellement dans Chromium : **88 réussis, 0 échoué**. Test de contraste du bloc principal réécrit (texte réel sur fond réel,
clair et sombre, 5 réglages de couleur). Contrastes AA, zones tactiles, texte 200 % : conformes. Android : compilation, 12 tests JUnit,
0 erreur de lint. iOS : non compilé. Appareils réels : aucun.

Vérification de l’archive `LIBRE-COMPLET.zip` extraite dans un dossier vierge : `npm ci`, `npm test` (88 réussis) ;
`libre-app` : `npm ci`, `npm run sync`, `gradlew assembleDebug bundleRelease :app:testDebugUnitTest` réussi ; aucun fichier de clé ni secret.

## 12. Envol + couleur par addiction

Exécutés réellement dans Chromium : **90 réussis, 0 échoué** (2 nouveaux tests de couleurs par addiction ; tests de navigation et
d'aide adaptés au bouton Aide central). Contrastes AA, zones tactiles, texte 200 % : conformes après 2 corrections. Android :
compilation, 12 tests JUnit, 0 erreur de lint. iOS : non compilé. Appareils réels : aucun.

Vérification de l’archive `LIBRE-COMPLET.zip` extraite dans un dossier vierge : `npm ci`, `npm test` (90 réussis) ; `libre-app` :
`npm ci`, `npm run sync`, `gradlew assembleDebug bundleRelease :app:testDebugUnitTest` réussi ; aucun fichier de clé ni secret.
