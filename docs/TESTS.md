# Rapport de tests de LIBRE (version 3)

Dernière exécution complète : **54 réussis · 0 échoués · 0 non exécutés** sur 54, le 22 novembre 2026, commande `npm test` (contrôle des langues, contrôle de `LIBRE.html`, puis les tests). Détail brut et mesures de charge : `tests/RESULTATS.md` (fichier écrit par le lanceur lui-même, jamais modifié à la main).

## Environnements

| Catégorie | Environnement | Résultat |
|---|---|---|
| Tests automatisés web | Playwright 1.63.0, Chromium sans interface, Linux, serveur local, fuseau et langue réglés par test | 54 réussis · 0 échoués · 0 non exécutés |
| Tests natifs simulés | Même navigateur ; les plugins Capacitor (coffre, partage, notifications, HealthKit, biométrie, bouton Retour) sont remplacés par des simulations qui ont la même interface | Inclus ci-dessus, groupes « Natif », « Notifications », « Santé Apple » |
| Tests unitaires Android | `./gradlew :app:testDebugUnitTest` (JUnit) : format chiffré du coffre | 7 réussis, 0 échec |
| Compilation Android | `./gradlew assembleDebug` avec Capacitor 8.6, SDK 36, BiometricPrompt | Réussie (APK de test dans `livraison/`) |
| Compilation iOS | — | **Non faite** : pas de Mac ni de Xcode dans mon environnement |
| Tests Android réels | — | **Non testé** : aucun téléphone ni émulateur disponible (pas de virtualisation) |
| Tests iOS réels | — | **Non testé** : aucun iPhone ni simulateur |
| Liens des sources | `tools/check-sources.py` | **Non testé** : réseau bloqué par l’environnement (erreur 403 du proxy) |

## Tests automatisés, un par un

Chaque test échoue aussi en cas d’erreur JavaScript dans la page. L’objectif de chaque test est son intitulé.

| Groupe | Test (objectif) | Environnement | Résultat | Durée | Limite |
|---|---|---|---|---|---|
| Démarrage | L’accueil s’affiche sans erreur ni requête externe | Chromium (web) | réussi | 1.0 s | — |
| Inscription | Créer un profil « cigarettes » de bout en bout, puis le retrouver après rechargement | Chromium (web) | réussi | 4.4 s | — |
| Suivi | Noter une consommation remet le compteur à zéro et persiste | Chromium (web) | réussi | 1.0 s | — |
| Suivi | Plusieurs addictions : changer l’addiction principale | Chromium (web) | réussi | 0.8 s | — |
| Journal | Pagination par 30 et recherche sur toutes les entrées | Chromium (web) | réussi | 1.2 s | — |
| Sécurité | Code PIN : PBKDF2 600 000, sel aléatoire, jamais en clair | Chromium (web) | réussi | 2.7 s | — |
| Sécurité | Code PIN : 5 erreurs bloquent l’accès, même après rechargement | Chromium (web) | réussi | 7.5 s | — |
| Sécurité | Code PIN ancien format : accepté puis converti en PBKDF2 | Chromium (web) | réussi | 0.7 s | — |
| Sécurité | Navigateur : chiffrement facultatif par mot de passe (rien en clair, mot de passe exigé, désactivation, oubli sans perte) | Chromium (web) | réussi | 5.7 s | — |
| Sécurité | Navigateur chiffré : changer le mot de passe, et deux onglets ouverts qui ne s’écrasent pas | Chromium (web) | réussi | 6.0 s | — |
| Sauvegarde | Fichier chiffré modifié à la main : refusé, données actuelles intactes | Chromium (web) | réussi | 5.1 s | — |
| Sauvegarde | Export chiffré : aucun texte lisible, mauvais mot de passe refusé, restauration exacte | Chromium (web) | réussi | 5.4 s | — |
| Sauvegarde | Export sans mot de passe : demande une confirmation explicite | Chromium (web) | réussi | 2.2 s | — |
| Sauvegarde | Fichier d’une version future, fichier corrompu, fichier hostile | Chromium (web) | réussi | 4.4 s | — |
| Sauvegarde | Revenir à l’état d’avant une restauration | Chromium (web) | réussi | 3.3 s | — |
| Sauvegarde | Effacer toutes les données | Chromium (web) | réussi | 2.5 s | — |
| Natif | Coffre chiffré : migration des anciennes données, plus rien en clair | Chromium + plugins natifs **simulés** | réussi | 1.3 s | Vérifie la logique de LIBRE, pas iOS ni Android |
| Natif | Coffre illisible : le fichier est mis de côté, jamais écrasé | Chromium + plugins natifs **simulés** | réussi | 1.9 s | Vérifie la logique de LIBRE, pas iOS ni Android |
| Natif | Coffre momentanément inaccessible : LIBRE attend, n’écrit rien en clair, ne met rien de côté, puis rouvre les données | Chromium + plugins natifs **simulés** | réussi | 1.0 s | Vérifie la logique de LIBRE, pas iOS ni Android |
| Natif | Version store : pas de mode démo, pas de service worker, pas d’installation PWA | Chromium + plugins natifs **simulés** | réussi | 1.1 s | Vérifie la logique de LIBRE, pas iOS ni Android |
| Natif | Export et bilan : feuille de partage du système | Chromium + plugins natifs **simulés** | réussi | 0.9 s | Vérifie la logique de LIBRE, pas iOS ni Android |
| Natif | Bouton Retour Android : ferme la fenêtre, revient en arrière, puis réduit l’app | Chromium + plugins natifs **simulés** | réussi | 1.1 s | Vérifie la logique de LIBRE, pas iOS ni Android |
| Notifications | Rappels natifs : discrets, ≤ 60, dans le futur, aucun pendant la période calme | Chromium + plugin de notifications **simulé** | réussi | 2.8 s | Pas de vraie notification affichée |
| Santé Apple | Connexion, synchronisation sans doublon, déconnexion qui efface | Chromium + HealthKit **simulé** (ou navigateur pour le cas « aucune fausse connexion ») | réussi | 4.5 s | Pas de vrai HealthKit |
| Santé Apple | Navigateur : aucune fausse connexion proposée | Chromium + HealthKit **simulé** (ou navigateur pour le cas « aucune fausse connexion ») | réussi | 0.9 s | Pas de vrai HealthKit |
| Langues | Chaque langue : navigation traduite, aucune erreur | Chromium (web) | réussi | 8.0 s | — |
| Langues | Lancement en 6 langues : seules les langues traduites sont proposées, les autres traductions restent dans le code | Chromium (web) | réussi | 2.0 s | — |
| Langues | Formats régionaux : dates et devise | Chromium (web) | réussi | 0.4 s | — |
| Accessibilité | Boutons et champs nommés, images décrites, sur tous les écrans | Chromium (web) | réussi | 1.7 s | Pas de vrai VoiceOver / TalkBack |
| Accessibilité | Cibles tactiles d’au moins 24 px (WCAG 2.2) sur les actions principales | Chromium (web) | réussi | 0.7 s | Pas de vrai VoiceOver / TalkBack |
| Affichage | Aucun débordement horizontal de 320 px à 1280 px, clair et sombre | Chromium (web) | réussi | 6.6 s | — |
| Performance | 3 ans d’historique, 4 addictions : chaque écran s’affiche en moins de 1,5 s | Chromium (web) | réussi | 2.0 s | Processeur ralenti par logiciel, pas un vrai téléphone |
| Distribution | LIBRE.html autonome : fonctionne depuis un fichier, sans aucune requête externe | Chromium (web) | réussi | 0.8 s | Chromium seulement |
| Distribution | PWA : service worker actif et fonctionnement hors ligne | Chromium (web) | réussi | 1.3 s | Chromium seulement |
| Apparence | Couleurs d’accent : contraste des boutons ≥ 4,5:1 en clair et en sombre | Chromium (web) | réussi | 16.1 s | — |
| Apparence | Réglage : changer la couleur et couper les effets, conservé après rechargement | Chromium (web) | réussi | 2.5 s | — |
| Apparence | Moins d’animations demandé par le système : aucune animation d’écran | Chromium (web) | réussi | 2.1 s | — |
| Apparence | Animations actives : ouverture, entrée des blocs, barres qui se transforment | Chromium (web) | réussi | 3.8 s | — |
| Apparence | Carte principale (couleur et sombre) : texte blanc lisible (≥ 4,5:1 mesuré sur les pixels), 4 couleurs, clair et sombre | Chromium (web) | réussi | 22.4 s | — |
| Distribution | Page de présentation : sans erreur, sans requête externe, sans débordement, FR et EN | Chromium (web) | réussi | 1.4 s | Chromium seulement |
| Statistiques | Graphiques à parcourir : glisser le doigt ou les flèches affiche la valeur, puis le résumé revient | Chromium (web) | réussi | 4.1 s | — |
| Suivi | Modifier une consommation passée : quantité et heure changées, compteur recalculé, annulable | Chromium (web) | réussi | 3.5 s | — |
| Journal | Modifier une entrée, filtrer par humeur et par mois | Chromium (web) | réussi | 3.3 s | — |
| Outils | Favoris : ajouter un exercice, il apparaît en haut et reste après rechargement | Chromium (web) | réussi | 3.5 s | — |
| Suivi | Modifier puis supprimer un suivi : réglages enregistrés, suppression récupérable depuis la copie de sécurité | Chromium (web) | réussi | 4.4 s | — |
| Outils | SOS et les 8 exercices s’ouvrent, se lancent et se ferment sans erreur | Chromium (web) | réussi | 10.9 s | — |
| Calculs | Jours calendaires exacts malgré les changements d’heure, les années bissextiles et 4 fuseaux horaires | Chromium (web) | réussi | 7.7 s | — |
| Affichage | Barres d’onglets : aucun libellé coupé à 320 et 375 px, dans les 6 langues complètes | Chromium (web) | réussi | 47.1 s | — |
| Journal | Brouillon : un texte non enregistré revient après une fermeture accidentelle, jamais écrit sur l’appareil | Chromium (web) | réussi | 3.4 s | — |
| Accessibilité | Texte agrandi à 200 % (WCAG 1.4.4) : aucun écran ne déborde, en français et en allemand | Chromium (web) | réussi | 8.7 s | Pas de vrai VoiceOver / TalkBack |
| Performance | Téléphone modeste simulé (processeur 4× plus lent) : 12 000 consommations, 5 000 entrées de journal, données chiffrées | Chromium (web) | réussi | 17.0 s | Processeur ralenti par logiciel, pas un vrai téléphone |
| Natif | Biométrie : cachée par défaut ; activée pour un essai, elle déverrouille sans remplacer le code (plugin simulé) | Chromium + plugins natifs **simulés** | réussi | 6.0 s | Vérifie la logique de LIBRE, pas iOS ni Android |
| Données | Données d’une version plus récente : lecture seule, rien n’est écrit par-dessus | Chromium (web) | réussi | 2.3 s | — |
| Suivi | Après un écart : le total des jours sans est mis en avant, pas un grand « 0 » (fr et en) | Chromium (web) | réussi | 3.8 s | — |

## Ce qui reste à tester sur de vrais appareils

Plan détaillé : `TESTS-APPAREILS.md` (installation, coffre, chiffrement, Santé Apple, notifications, partage, verrouillage, biométrie, VoiceOver / TalkBack, mode avion, redémarrage, permissions, bouton Retour). Tant que ces essais ne sont pas faits, rien de ce qui dépend d’iOS ou d’Android n’est à considérer comme vérifié.

## Comment relancer

```
npm ci
npm run test:setup   # télécharge Chromium pour Playwright (une fois)
npm test
```
