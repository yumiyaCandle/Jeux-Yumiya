# Rapport de tests de LIBRE (version 4)

Dernière exécution complète : **58 réussis · 0 échoués · 0 non exécutés** sur 58, le 2026-11-21 23:56 UTC, avec `npm test` (contrôle des langues, contrôle de `LIBRE.html`, puis les tests Playwright). Détail brut : `tests/RESULTATS.md`, écrit par le lanceur lui-même.

## Synthèse par catégorie

| Catégorie | Environnement | Résultat (21/11/2026) |
|---|---|---|
| Tests automatisés web | Playwright 1.63.0, Chromium sans interface, Linux, serveur local | 58 réussis · 0 échoués · 0 non exécutés |
| Tests natifs **simulés** | Même navigateur ; plugins Capacitor remplacés par des simulations de même interface | Inclus ci-dessus (colonne « Nature » = Simulé) |
| Tests unitaires Android | `./gradlew :app:testDebugUnitTest` (format chiffré du coffre) | 7 réussis |
| Compilation Android debug | `assembleDebug` | Réussie |
| Compilation Android release | `assembleRelease`, `bundleRelease` (AAB) | Réussies, **non signées** |
| Analyse Android (lint) | `lintRelease` | 0 erreur, 29 avertissements mineurs |
| Dépendances | `npm audit` (racine et `libre-app`) | 0 vulnérabilité signalée |
| Compilation iOS | — | **Non testé** : pas de Mac ni de Xcode |
| Android réel | — | **Non testé** : aucun téléphone ni émulateur |
| iOS réel | — | **Non testé** : aucun iPhone ni simulateur |
| Liens des sources | `tools/check-sources.py` | **Non testé** : réseau bloqué (403 du proxy) |
| Numéros d’aide | Recherche web | 44 confirmés, 65 à vérifier (`RESSOURCES-AIDE.md`) ; aucun appel réel |
| Contrôle visuel | Captures sur 7 configurations, examinées à l’œil | 1 régression trouvée et corrigée (en-tête du calendrier) |

## Tests automatisés, un par un

L’objectif de chaque test est son intitulé. Chaque test échoue aussi en cas d’erreur JavaScript dans la page.

| Groupe | Test (objectif) | Nature | Environnement | Résultat | Durée | Limite |
|---|---|---|---|---|---|---|
| Démarrage | L’accueil s’affiche sans erreur ni requête externe | Web réel | Chromium | réussi | 1.0 s | — |
| Inscription | Créer un profil « cigarettes » de bout en bout, puis le retrouver après rechargement | Web réel | Chromium | réussi | 4.6 s | — |
| Suivi | Noter une consommation remet le compteur à zéro et persiste | Web réel | Chromium | réussi | 1.1 s | — |
| Suivi | Plusieurs addictions : changer l’addiction principale | Web réel | Chromium | réussi | 0.9 s | — |
| Journal | Pagination par 30 et recherche sur toutes les entrées | Web réel | Chromium | réussi | 1.3 s | — |
| Sécurité | Code PIN : PBKDF2 600 000, sel aléatoire, jamais en clair | Web réel | Chromium | réussi | 2.7 s | — |
| Sécurité | Code PIN : 5 erreurs bloquent l’accès, même après rechargement | Web réel | Chromium | réussi | 7.4 s | — |
| Sécurité | Code PIN ancien format : accepté puis converti en PBKDF2 | Web réel | Chromium | réussi | 0.6 s | — |
| Sécurité | Navigateur : chiffrement facultatif par mot de passe (rien en clair, mot de passe exigé, désactivation, oubli sans perte) | Web réel | Chromium | réussi | 5.6 s | — |
| Sécurité | Navigateur chiffré : changer le mot de passe, et deux onglets ouverts qui ne s’écrasent pas | Web réel | Chromium | réussi | 6.3 s | — |
| Sauvegarde | Fichier chiffré modifié à la main : refusé, données actuelles intactes | Web réel | Chromium | réussi | 5.2 s | — |
| Sauvegarde | Export chiffré : aucun texte lisible, mauvais mot de passe refusé, restauration exacte | Web réel | Chromium | réussi | 5.4 s | — |
| Sauvegarde | Export sans mot de passe : demande une confirmation explicite | Web réel | Chromium | réussi | 2.2 s | — |
| Sauvegarde | Fichier d’une version future, fichier corrompu, fichier hostile | Web réel | Chromium | réussi | 4.3 s | — |
| Sauvegarde | Revenir à l’état d’avant une restauration | Web réel | Chromium | réussi | 3.4 s | — |
| Sauvegarde | Effacer toutes les données | Web réel | Chromium | réussi | 2.4 s | — |
| Natif | Coffre chiffré : migration des anciennes données, plus rien en clair | Simulé | Chromium + plugins natifs **simulés** | réussi | 1.3 s | Logique de LIBRE seulement, pas iOS ni Android |
| Natif | Coffre illisible : le fichier est mis de côté, jamais écrasé | Simulé | Chromium + plugins natifs **simulés** | réussi | 1.9 s | Logique de LIBRE seulement, pas iOS ni Android |
| Natif | Coffre momentanément inaccessible : LIBRE attend, n’écrit rien en clair, ne met rien de côté, puis rouvre les données | Simulé | Chromium + plugins natifs **simulés** | réussi | 1.1 s | Logique de LIBRE seulement, pas iOS ni Android |
| Natif | Version store : pas de mode démo, pas de service worker, pas d’installation PWA | Simulé | Chromium + plugins natifs **simulés** | réussi | 1.1 s | Logique de LIBRE seulement, pas iOS ni Android |
| Natif | Export et bilan : feuille de partage du système | Simulé | Chromium + plugins natifs **simulés** | réussi | 1.0 s | Logique de LIBRE seulement, pas iOS ni Android |
| Natif | Bouton Retour Android : ferme la fenêtre, revient en arrière, puis réduit l’app | Simulé | Chromium + plugins natifs **simulés** | réussi | 1.3 s | Logique de LIBRE seulement, pas iOS ni Android |
| Notifications | Rappels natifs : discrets, ≤ 60, dans le futur, aucun pendant la période calme | Simulé | Chromium + plugin de notifications **simulé** | réussi | 2.8 s | Aucune vraie notification |
| Santé Apple | Connexion, synchronisation sans doublon, déconnexion qui efface | Simulé | Chromium + HealthKit **simulé** (ou navigateur) | réussi | 4.5 s | Pas de vrai HealthKit |
| Santé Apple | Navigateur : aucune fausse connexion proposée | Simulé | Chromium + HealthKit **simulé** (ou navigateur) | réussi | 1.0 s | Pas de vrai HealthKit |
| Langues | Chaque langue : navigation traduite, aucune erreur | Web réel | Chromium | réussi | 8.8 s | — |
| Langues | Lancement en 6 langues : seules les langues traduites sont proposées, les autres traductions restent dans le code | Web réel | Chromium | réussi | 2.1 s | — |
| Langues | Formats régionaux : dates et devise | Web réel | Chromium | réussi | 0.4 s | — |
| Accessibilité | Boutons et champs nommés, images décrites, sur tous les écrans | Web réel | Chromium | réussi | 1.6 s | Pas de vrai VoiceOver / TalkBack |
| Accessibilité | Cibles tactiles d’au moins 24 px (WCAG 2.2) sur les actions principales | Web réel | Chromium | réussi | 0.7 s | Pas de vrai VoiceOver / TalkBack |
| Affichage | Aucun débordement horizontal de 320 px à 1280 px, clair et sombre | Web réel | Chromium | réussi | 6.3 s | — |
| Performance | 3 ans d’historique, 4 addictions : chaque écran s’affiche en moins de 1,5 s | Web réel | Chromium | réussi | 1.7 s | Processeur ralenti par logiciel |
| Distribution | LIBRE.html autonome : fonctionne depuis un fichier, sans aucune requête externe | Web réel | Chromium | réussi | 0.8 s | Chromium seulement |
| Distribution | PWA : service worker actif et fonctionnement hors ligne | Web réel | Chromium | réussi | 1.3 s | Chromium seulement |
| Apparence | Couleurs d’accent : contraste des boutons ≥ 4,5:1 en clair et en sombre | Web réel | Chromium | réussi | 16.0 s | — |
| Apparence | Réglage : changer la couleur et couper les effets, conservé après rechargement | Web réel | Chromium | réussi | 2.6 s | — |
| Apparence | Moins d’animations demandé par le système : aucune animation d’écran | Web réel | Chromium | réussi | 2.1 s | — |
| Apparence | Animations actives : ouverture, entrée des blocs, barres qui se transforment | Web réel | Chromium | réussi | 3.8 s | — |
| Apparence | Carte principale (couleur et sombre) : texte blanc lisible (≥ 4,5:1 mesuré sur les pixels), 4 couleurs, clair et sombre | Web réel | Chromium | réussi | 22.2 s | — |
| Distribution | Page de présentation : sans erreur, sans requête externe, sans débordement, FR et EN | Web réel | Chromium | réussi | 1.3 s | Chromium seulement |
| Statistiques | Graphiques à parcourir : glisser le doigt ou les flèches affiche la valeur, puis le résumé revient | Web réel | Chromium | réussi | 4.1 s | — |
| Suivi | Modifier une consommation passée : quantité et heure changées, compteur recalculé, annulable | Web réel | Chromium | réussi | 3.5 s | — |
| Journal | Modifier une entrée, filtrer par humeur et par mois | Web réel | Chromium | réussi | 3.3 s | — |
| Outils | Favoris : ajouter un exercice, il apparaît en haut et reste après rechargement | Web réel | Chromium | réussi | 3.2 s | — |
| Suivi | Modifier puis supprimer un suivi : réglages enregistrés, suppression récupérable depuis la copie de sécurité | Web réel | Chromium | réussi | 4.0 s | — |
| Outils | SOS et les 8 exercices s’ouvrent, se lancent et se ferment sans erreur | Web réel | Chromium | réussi | 10.9 s | — |
| Calculs | Jours calendaires exacts malgré les changements d’heure, les années bissextiles et 4 fuseaux horaires | Web réel | Chromium | réussi | 7.7 s | — |
| Affichage | Barres d’onglets : aucun libellé coupé à 320 et 375 px, dans les 6 langues complètes | Web réel | Chromium | réussi | 47.2 s | — |
| Journal | Brouillon : un texte non enregistré revient après une fermeture accidentelle, jamais écrit sur l’appareil | Web réel | Chromium | réussi | 3.4 s | — |
| Accessibilité | Texte agrandi à 200 % (WCAG 1.4.4) : aucun écran ne déborde, en français et en allemand | Web réel | Chromium | réussi | 8.8 s | Pas de vrai VoiceOver / TalkBack |
| Performance | Téléphone modeste simulé (processeur 4× plus lent) : 12 000 consommations, 5 000 entrées de journal, données chiffrées | Web réel | Chromium | réussi | 15.3 s | Processeur ralenti par logiciel |
| Natif | Biométrie : cachée par défaut ; activée pour un essai, elle déverrouille sans remplacer le code (plugin simulé) | Simulé | Chromium + plugins natifs **simulés** | réussi | 5.9 s | Logique de LIBRE seulement, pas iOS ni Android |
| Données | Données d’une version plus récente : lecture seule, rien n’est écrit par-dessus | Web réel | Chromium | réussi | 2.4 s | — |
| Aide | Pays absent de la table (Luxembourg) : jamais les numéros d’un autre pays, numéro d’urgence local et choix du pays | Web réel | Chromium | réussi | 2.0 s | Affichage seulement, pas d’appel réel |
| Aide | Suisse : numéros affichés avec la date de revérification ; pays non revérifié : avertissement | Web réel | Chromium | réussi | 4.1 s | Affichage seulement, pas d’appel réel |
| Sauvegarde | Tout effacer : la copie de sécurité est annoncée et peut être supprimée ; les copies mises de côté sont effacées | Web réel | Chromium | réussi | 2.7 s | — |
| Affichage | Calendrier à 320 px : l’en-tête « ‹ mois › » reste sur une ligne (fr, it, de) | Web réel | Chromium | réussi | 5.9 s | — |
| Suivi | Après un écart : le total des jours sans est mis en avant, pas un grand « 0 » (fr et en) | Web réel | Chromium | réussi | 3.9 s | — |

## Ce qui reste à tester sur appareils réels

Plan et feuille de résultats : `TESTS-APPAREILS.md`. Tant que ces essais ne sont pas faits, rien de ce qui dépend d’iOS ou d’Android n’est vérifié.

## Relancer

```
npm ci
npm run test:setup   # télécharge Chromium pour Playwright (une fois)
npm test
```
