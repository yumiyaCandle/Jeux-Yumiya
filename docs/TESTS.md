# Rapport de tests de LIBRE (version finale)

Dernière exécution complète : **75 réussis · 0 échoués · 0 non exécutés** sur 75, le 2026-11-22 05:23 UTC, avec `npm test` (contrôle des langues, contrôle de `LIBRE.html`, puis les tests Playwright). Détail brut : `tests/RESULTATS.md`, écrit par le lanceur lui-même.

## Synthèse par catégorie

| Catégorie | Environnement | Résultat (22/11/2026) |
|---|---|---|
| Tests automatisés web | Playwright 1.63.0, Chromium sans interface, Linux, serveur local | 75 réussis · 0 échoués · 0 non exécutés |
| Tests natifs **simulés** | Même navigateur ; plugins Capacitor remplacés par des simulations de même interface | Inclus ci-dessus (colonne « Nature » = Simulé) |
| Tests unitaires Android | `./gradlew :app:testDebugUnitTest` (format chiffré du coffre, dont 5 scénarios d'attaque) | 12 réussis (11 de chiffrement + 1 exemple) |
| Compilation Android debug | `assembleDebug` | Réussie |
| Compilation Android release | `assembleRelease`, `bundleRelease` (AAB) | Réussies, **non signées** |
| Analyse Android (lint) | `lintRelease` | 0 erreur, 29 avertissements mineurs |
| Dépendances | `npm audit` (racine et `libre-app`) | 0 vulnérabilité signalée |
| Compilation iOS | — | **Non testé** : pas de Mac ni de Xcode |
| Android réel | — | **Non testé** : aucun téléphone ni émulateur |
| iOS réel | — | **Non testé** : aucun iPhone ni simulateur |
| Liens des sources | `tools/check-sources.py` | **Non testé** : réseau bloqué (403 du proxy) |
| Numéros d’aide | Recherche web | 46 confirmés (source officielle ou institutionnelle), 3 probables, 65 à vérifier (`RESSOURCES-AIDE.md`) ; aucun appel réel |
| Contrastes (WCAG AA) | `npm run check:contrast` : 9 écrans + formulaire + SOS, clair et sombre | Aucun texte mesurable sous le seuil |
| Zones tactiles (WCAG 2.5.8) | `npm run check:targets` | Toutes au moins 24 × 24 px |
| Versions et fichiers générés | `npm run check:versions` | 1.0.0 (build 1) partout ; copies natives et `LIBRE.html` à jour |
| Contrôle visuel | Captures avant/après (320, 375, 393 sombre, texte 150 %), examinées à l’œil | 9 défauts corrigés (`UX-UI-REVIEW.md`) |

## Tests automatisés, un par un

L’objectif de chaque test est son intitulé. Chaque test échoue aussi en cas d’erreur JavaScript dans la page.

| Groupe | Test (objectif) | Nature | Environnement | Résultat | Durée | Limite |
|---|---|---|---|---|---|---|
| Démarrage | L’accueil s’affiche sans erreur ni requête externe | Web réel | Chromium | réussi | 0.9 s | — |
| Inscription | Créer un profil « cigarettes » de bout en bout, puis le retrouver après rechargement | Web réel | Chromium | réussi | 4.3 s | — |
| Sécurité santé | Création d’un suivi « alcool » : l’avertissement de sevrage s’affiche avant de commencer, et pas pour les cigarettes | Web réel | Chromium | réussi | 6.2 s | — |
| Suivi | Noter une consommation remet le compteur à zéro et persiste | Web réel | Chromium | réussi | 0.9 s | — |
| Suivi | Plusieurs addictions : changer l’addiction principale | Web réel | Chromium | réussi | 0.7 s | — |
| Journal | Pagination par 30 et recherche sur toutes les entrées | Web réel | Chromium | réussi | 1.2 s | — |
| Sécurité | Code PIN : PBKDF2 600 000, sel aléatoire, jamais en clair | Web réel | Chromium | réussi | 2.6 s | — |
| Sécurité | Code PIN : 5 erreurs bloquent l’accès, même après rechargement | Web réel | Chromium | réussi | 7.2 s | — |
| Sécurité | Code PIN ancien format : accepté puis converti en PBKDF2 | Web réel | Chromium | réussi | 0.5 s | — |
| Sécurité | Navigateur : chiffrement facultatif par mot de passe (rien en clair, mot de passe exigé, désactivation, oubli sans perte) | Web réel | Chromium | réussi | 5.1 s | — |
| Sécurité | Navigateur chiffré : changer le mot de passe, et deux onglets ouverts qui ne s’écrasent pas | Web réel | Chromium | réussi | 5.8 s | — |
| Sauvegarde | Fichier chiffré modifié à la main : refusé, données actuelles intactes | Web réel | Chromium | réussi | 5.0 s | — |
| Sauvegarde | Export chiffré : aucun texte lisible, mauvais mot de passe refusé, restauration exacte | Web réel | Chromium | réussi | 5.1 s | — |
| Sauvegarde | Export sans mot de passe : demande une confirmation explicite | Web réel | Chromium | réussi | 2.1 s | — |
| Sauvegarde | Fichier d’une version future, fichier corrompu, fichier hostile | Web réel | Chromium | réussi | 4.2 s | — |
| Sauvegarde | Revenir à l’état d’avant une restauration | Web réel | Chromium | réussi | 3.2 s | — |
| Sauvegarde | Effacer toutes les données | Web réel | Chromium | réussi | 2.3 s | — |
| Natif | Coffre chiffré : migration des anciennes données, plus rien en clair | Simulé | Chromium + plugins natifs **simulés** | réussi | 1.0 s | Logique de LIBRE seulement, pas iOS ni Android |
| Natif | Coffre illisible : le fichier est mis de côté, jamais écrasé | Simulé | Chromium + plugins natifs **simulés** | réussi | 1.9 s | Logique de LIBRE seulement, pas iOS ni Android |
| Natif | Coffre momentanément inaccessible : LIBRE attend, n’écrit rien en clair, ne met rien de côté, puis rouvre les données | Simulé | Chromium + plugins natifs **simulés** | réussi | 0.9 s | Logique de LIBRE seulement, pas iOS ni Android |
| Natif | Version store : pas de mode démo, pas de service worker, pas d’installation PWA | Simulé | Chromium + plugins natifs **simulés** | réussi | 1.0 s | Logique de LIBRE seulement, pas iOS ni Android |
| Natif | Export et bilan : feuille de partage du système | Simulé | Chromium + plugins natifs **simulés** | réussi | 0.7 s | Logique de LIBRE seulement, pas iOS ni Android |
| Natif | Bouton Retour Android : ferme la fenêtre, revient en arrière, puis réduit l’app | Simulé | Chromium + plugins natifs **simulés** | réussi | 1.1 s | Logique de LIBRE seulement, pas iOS ni Android |
| Notifications | Rappels natifs : discrets, ≤ 60, dans le futur, aucun pendant la période calme | Simulé | Chromium + plugin de notifications **simulé** | réussi | 2.8 s | Aucune vraie notification |
| Santé Apple | Connexion, synchronisation sans doublon, déconnexion qui efface | Simulé | Chromium + HealthKit **simulé** (ou navigateur) | réussi | 4.4 s | Pas de vrai HealthKit |
| Santé Apple | Navigateur : aucune fausse connexion proposée | Simulé | Chromium + HealthKit **simulé** (ou navigateur) | réussi | 0.8 s | Pas de vrai HealthKit |
| Langues | Chaque langue : navigation traduite, aucune erreur | Web réel | Chromium | réussi | 6.3 s | — |
| Langues | Lancement en 6 langues : seules les langues traduites sont proposées, les autres traductions restent dans le code | Web réel | Chromium | réussi | 1.9 s | — |
| Langues | Formats régionaux : dates et devise | Web réel | Chromium | réussi | 0.3 s | — |
| Accessibilité | Boutons et champs nommés, images décrites, sur tous les écrans | Web réel | Chromium | réussi | 1.6 s | Pas de vrai VoiceOver / TalkBack |
| Accessibilité | Cibles tactiles d’au moins 24 px (WCAG 2.2) sur les actions principales | Web réel | Chromium | réussi | 0.6 s | Pas de vrai VoiceOver / TalkBack |
| Affichage | Aucun débordement horizontal de 320 px à 1280 px, clair et sombre | Web réel | Chromium | réussi | 5.7 s | — |
| Performance | 3 ans d’historique, 4 addictions : chaque écran s’affiche en moins de 1,5 s | Web réel | Chromium | réussi | 1.4 s | Processeur ralenti par logiciel |
| Distribution | LIBRE.html autonome : fonctionne depuis un fichier, sans aucune requête externe | Web réel | Chromium | réussi | 0.7 s | Chromium seulement |
| Distribution | PWA : service worker actif et fonctionnement hors ligne | Web réel | Chromium | réussi | 1.1 s | Chromium seulement |
| Apparence | Couleurs d’accent : contraste des boutons ≥ 4,5:1 en clair et en sombre | Web réel | Chromium | réussi | 15.3 s | — |
| Apparence | Réglage : changer la couleur et activer les effets (verre), conservé après rechargement | Web réel | Chromium | réussi | 2.5 s | — |
| Apparence | Moins d’animations demandé par le système : aucune animation d’écran | Web réel | Chromium | réussi | 2.0 s | — |
| Apparence | Option « verre » : animations d’ouverture, entrée des blocs, barres qui se transforment | Web réel | Chromium | réussi | 3.8 s | — |
| Apparence | Carte principale (couleur et sombre) : texte blanc lisible (≥ 4,5:1 mesuré sur les pixels), 4 couleurs, clair et sombre | Web réel | Chromium | réussi | 20.1 s | — |
| Distribution | Page de présentation : sans erreur, sans requête externe, sans débordement, FR et EN | Web réel | Chromium | réussi | 1.4 s | Chromium seulement |
| Statistiques | Graphiques à parcourir : glisser le doigt ou les flèches affiche la valeur, puis le résumé revient | Web réel | Chromium | réussi | 4.0 s | — |
| Suivi | Modifier une consommation passée : quantité et heure changées, compteur recalculé, annulable | Web réel | Chromium | réussi | 3.4 s | — |
| Journal | Modifier une entrée, filtrer par humeur et par mois | Web réel | Chromium | réussi | 3.1 s | — |
| Outils | Favoris : ajouter un exercice, il apparaît en haut et reste après rechargement | Web réel | Chromium | réussi | 3.1 s | — |
| Suivi | Modifier puis supprimer un suivi : réglages enregistrés, suppression récupérable depuis la copie de sécurité | Web réel | Chromium | réussi | 3.8 s | — |
| Outils | SOS et les 8 exercices s’ouvrent, se lancent et se ferment sans erreur | Web réel | Chromium | réussi | 10.8 s | — |
| Calculs | Jours calendaires exacts malgré les changements d’heure, les années bissextiles et 4 fuseaux horaires | Web réel | Chromium | réussi | 7.6 s | — |
| Affichage | Barres d’onglets : aucun libellé coupé à 320 et 375 px, dans les 6 langues complètes | Web réel | Chromium | réussi | 46.2 s | — |
| Journal | Brouillon : un texte non enregistré revient après une fermeture accidentelle, jamais écrit sur l’appareil | Web réel | Chromium | réussi | 3.1 s | — |
| Accessibilité | Texte agrandi à 200 % (WCAG 1.4.4) : aucun écran ne déborde, en français et en allemand | Web réel | Chromium | réussi | 8.6 s | Pas de vrai VoiceOver / TalkBack |
| Performance | Téléphone modeste simulé (processeur 4× plus lent) : 12 000 consommations, 5 000 entrées de journal, données chiffrées | Web réel | Chromium | réussi | 13.9 s | Processeur ralenti par logiciel |
| Natif | Biométrie : cachée par défaut ; activée pour un essai, elle déverrouille sans remplacer le code (plugin simulé) | Simulé | Chromium + plugins natifs **simulés** | réussi | 5.6 s | Logique de LIBRE seulement, pas iOS ni Android |
| Données | Données d’une version plus récente : lecture seule, rien n’est écrit par-dessus | Web réel | Chromium | réussi | 2.2 s | — |
| Aide | Pays absent de la table (Luxembourg) : jamais les numéros d’un autre pays, numéro d’urgence local et choix du pays | Web réel | Chromium | réussi | 1.9 s | Affichage seulement, pas d’appel réel |
| Aide | Suisse : numéros affichés avec la date de revérification ; pays non revérifié : avertissement | Web réel | Chromium | réussi | 4.0 s | Affichage seulement, pas d’appel réel |
| Sauvegarde | Tout effacer : la copie de sécurité est annoncée et peut être supprimée ; les copies mises de côté sont effacées | Web réel | Chromium | réussi | 2.7 s | — |
| Affichage | Calendrier à 320 px : l’en-tête « ‹ mois › » reste sur une ligne (fr, it, de) | Web réel | Chromium | réussi | 5.8 s | — |
| Sécurité | Politique de sécurité (CSP) : aucune violation en parcourant l’app, et toute connexion vers un serveur extérieur est bloquée | Web réel | Chromium | réussi | 3.4 s | — |
| Aide | Jeux d’argent : la ligne spécialisée du pays n’apparaît que si cette habitude est suivie | Web réel | Chromium | réussi | 4.3 s | Affichage seulement, pas d’appel réel |
| Scénario A | Découverte : objectif « mieux comprendre », difficultés et accompagnement choisis ; ni âge, ni sexe, ni taille, ni poids demandés ; accueil sans compteur d’abstinence | Web réel | Chromium | réussi | 4.8 s | — |
| Suivi | Réduction : le bloc principal montre la moyenne sur 7 jours et ce qui reste, jamais un compteur « jours sans » | Web réel | Chromium | réussi | 1.8 s | — |
| Scénario C | Journée difficile : pistes simples, objectif allégé pour la journée puis rétabli, numéro d’urgence du pays proposé | Web réel | Chromium | réussi | 3.0 s | — |
| Scénario B | Envie forte : 5 minutes guidées, bilan avec déclencheur et émotion facultatifs, tout est enregistré | Web réel | Chromium | réussi | 3.8 s | — |
| Personnalisation | Conseils personnalisés : désactivables dans le profil ; les messages de sécurité restent (alcool, premiers jours) | Web réel | Chromium | réussi | 4.1 s | — |
| Aide | Numéros groupés par situation ; LIBRE n’est pas un service d’urgence ; Suisse : ligne jeu excessif 0800 040 080 si l’habitude est suivie | Web réel | Chromium | réussi | 2.1 s | Affichage seulement, pas d’appel réel |
| Scénario H | Notifications refusées dans le téléphone : rien n’est programmé, un message clair, l’app reste entièrement utilisable | Web réel | Chromium | réussi | 2.9 s | — |
| Apparence | Direction Horizon par défaut, y compris pour les profils existants ; l’ancien style « verre » reste une option | Web réel | Chromium | réussi | 2.3 s | — |
| Confidentialité | Voile : dès que LIBRE passe en arrière-plan, le contenu est masqué, puis réapparaît au retour | Web réel | Chromium | réussi | 1.9 s | — |
| Confidentialité | Tout effacer annule les rappels déjà programmés dans le téléphone, et rien ne réapparaît après réouverture | Web réel | Chromium | réussi | 3.9 s | — |
| Exports | Bilan mensuel : journal et habitude contenant du HTML et du JavaScript, rien ne s’exécute ; nom de fichier sans donnée personnelle | Web réel | Chromium | réussi | 2.6 s | — |
| Santé Apple | États exacts : « autorisation demandée, aucune donnée », synchronisation incomplète signalée, resynchronisation sur 7 jours (plugin simulé) | Simulé | Chromium + HealthKit **simulé** (ou navigateur) | réussi | 4.0 s | Pas de vrai HealthKit |
| Données | Migration : un état de la version 3 (sans marqueur dataV) est relu sans perte, puis marqué dataV 3 | Web réel | Chromium | réussi | 2.3 s | — |
| Scénario | Nouveau téléphone : profil complet, export chiffré, restauration dans un autre navigateur vierge, tout est identique | Web réel | Chromium | réussi | 6.1 s | — |
| Suivi | Après un écart : le total des jours sans est mis en avant, pas un grand « 0 » (fr et en) | Web réel | Chromium | réussi | 3.8 s | — |

## Ce qui reste à tester sur appareils réels

Plan et feuille de résultats : `TESTS-APPAREILS.md`. Tant que ces essais ne sont pas faits, rien de ce qui dépend d’iOS ou d’Android n’est vérifié.

## Relancer

```
npm ci
npm run test:setup   # télécharge Chromium pour Playwright (une fois)
npm test
```
