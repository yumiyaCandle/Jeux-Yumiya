# Rapport de tests : refonte du 21 novembre 2026

- **Tests automatisés** : `node tests/run.js` (Playwright, Chromium, serveur local). Résultat détaillé et à jour : `tests/RESULTATS.md`.
  Dernière exécution : **43 réussis, 0 échoué, 0 non exécuté**. Chaque test échoue s'il y a une erreur JavaScript.
- **Android** : `./gradlew assembleDebug :app:testDebugUnitTest` réussi ; 7 tests unitaires (format chiffré du coffre) réussis.
- **Contrôles visuels** : captures à 360 px en arabe et en allemand (Accueil, Outils, Profil), graphiques en clair et sombre.
- Les apps natives tournent ici avec des **plugins simulés** (même interface que les vrais). Cela vérifie la logique de LIBRE, pas le
  comportement réel d'iOS ou d'Android.

## Les 24 points demandés

| # | Point | Test(s) | Résultat |
|---|---|---|---|
| 1 | Première ouverture | Démarrage ; Inscription | Réussi |
| 2 | Création d'un suivi | Inscription (profil « cigarettes » de bout en bout, rechargement) | Réussi |
| 3 | Modification d'un suivi | Modifier puis supprimer un suivi | Réussi (nouveau) |
| 4 | Suppression d'un suivi | Idem : l'autre suivi et ses consommations restent ; retour possible par la copie de sécurité | Réussi (nouveau) |
| 5 | Ajout d'une consommation | Noter une consommation remet le compteur à zéro et persiste | Réussi |
| 6 | Déclaration d'une reprise | Après un écart : total des jours sans mis en avant | Réussi |
| 7 | Calcul des jours | Modifier une consommation passée (30 h → 1 jour) ; Après un écart | Réussi |
| 8 | Statistiques | Graphiques à parcourir ; Performance (3 ans, 4 addictions) | Réussi |
| 9 | Navigation entre les écrans | Accessibilité (tous les écrans) ; Bouton Retour Android ; Performance (chaque écran) | Réussi |
| 10 | Changement de langue | Chaque langue : navigation traduite, aucune erreur (19 langues) ; formats régionaux | Réussi |
| 11 | Changement de thème | Apparence (couleur, effets, conservés après rechargement) ; contraste clair et sombre | Réussi |
| 12 | Journal | Pagination et recherche ; Modifier une entrée, filtres humeur et mois | Réussi |
| 13 | Gestion des envies | SOS et les 8 exercices | Réussi (ouverture et première étape) |
| 14 | Exercices | SOS et les 8 exercices ; Favoris | Réussi |
| 15 | Notifications | Rappels natifs : discrets, au plus 60, dans le futur, période calme respectée | Réussi (plugin simulé) |
| 16 | Verrouillage | Code PIN (3 tests) ; chiffrement web par mot de passe | Réussi |
| 17 | Exportation | Export chiffré ; export sans mot de passe confirmé ; feuille de partage native | Réussi |
| 18 | Restauration | Restauration exacte ; revenir à l'état d'avant | Réussi |
| 19 | Gestion des erreurs | Mauvais mot de passe (sauvegarde, coffre web, code PIN) ; stockage bloqué signalé | Réussi (le stockage bloqué n’a pas de test dédié) |
| 20 | Données corrompues | Fichier futur, corrompu, hostile ; coffre natif illisible mis de côté | Réussi |
| 21 | Hors ligne | PWA : service worker et fonctionnement hors ligne ; LIBRE.html sans requête externe | Réussi |
| 22 | Compatibilité mobile | Aucun débordement de 320 à 1280 px, clair et sombre ; captures 360 px | Réussi |
| 23 | Accessibilité | Noms des boutons et champs, images décrites, cibles ≥ 24 px, moins d'animations, graphiques au clavier | Réussi |
| 24 | Intégrations natives | Coffre (migration, illisible), Santé Apple (connexion, doublons, déconnexion), partage, bouton Retour | Réussi **avec plugins simulés** ; Android compilé |

## Non testé (et pourquoi)

| Élément | Raison |
|---|---|
| Compilation et exécution iOS, Santé Apple réelle | Nécessite un Mac avec Xcode 26 et un iPhone |
| Rappels réels app fermée, après redémarrage, permission refusée par le système | Pas d'appareil ni d'émulateur (pas de virtualisation ici) |
| VoiceOver, TalkBack, texte agrandi à 200 % | Lecteurs d'écran et réglages système indisponibles ici ; les noms accessibles sont vérifiés automatiquement |
| Rechargement après 5 minutes en arrière-plan (web chiffré) | Non automatisé (temps réel) ; la logique est simple, à vérifier à la main |
| Plusieurs onglets ouverts avec le chiffrement web | Non automatisé |
| Changement de fuseau horaire en cours d'utilisation | Les calculs utilisent l'heure locale de l'appareil ; non simulé |
| Safari et Firefox | La suite tourne sur Chromium seulement |
| Traductions des 14 langues partielles | Pas de relecture possible ; 826 textes restent en anglais (dit dans l'app) |

Le plan manuel pour les appareils réels est dans `TESTS-APPAREILS.md`.
