# Résultats des tests automatisés

Exécutés le 2026-11-21 18:12 UTC, Chromium (Playwright), serveur local.

**43 réussis · 0 échoués · 0 non exécutés** sur 43.

| Groupe | Test | Résultat | Durée |
|---|---|---|---|
| Démarrage | L’accueil s’affiche sans erreur ni requête externe | réussi | 1.0 s |
| Inscription | Créer un profil « cigarettes » de bout en bout, puis le retrouver après rechargement | réussi | 4.4 s |
| Suivi | Noter une consommation remet le compteur à zéro et persiste | réussi | 1.1 s |
| Suivi | Plusieurs addictions : changer l’addiction principale | réussi | 0.9 s |
| Journal | Pagination par 30 et recherche sur toutes les entrées | réussi | 1.3 s |
| Sécurité | Code PIN : PBKDF2 600 000, sel aléatoire, jamais en clair | réussi | 2.8 s |
| Sécurité | Code PIN : 5 erreurs bloquent l’accès, même après rechargement | réussi | 7.3 s |
| Sécurité | Code PIN ancien format : accepté puis converti en PBKDF2 | réussi | 0.6 s |
| Sécurité | Navigateur : chiffrement facultatif par mot de passe (rien en clair, mot de passe exigé, désactivation, oubli sans perte) | réussi | 6.0 s |
| Sauvegarde | Export chiffré : aucun texte lisible, mauvais mot de passe refusé, restauration exacte | réussi | 5.3 s |
| Sauvegarde | Export sans mot de passe : demande une confirmation explicite | réussi | 2.2 s |
| Sauvegarde | Fichier d’une version future, fichier corrompu, fichier hostile | réussi | 4.3 s |
| Sauvegarde | Revenir à l’état d’avant une restauration | réussi | 3.3 s |
| Sauvegarde | Effacer toutes les données | réussi | 2.4 s |
| Natif | Coffre chiffré : migration des anciennes données, plus rien en clair | réussi | 1.3 s |
| Natif | Coffre illisible : le fichier est mis de côté, jamais écrasé | réussi | 1.9 s |
| Natif | Version store : pas de mode démo, pas de service worker, pas d’installation PWA | réussi | 1.1 s |
| Natif | Export et bilan : feuille de partage du système | réussi | 1.0 s |
| Natif | Bouton Retour Android : ferme la fenêtre, revient en arrière, puis réduit l’app | réussi | 1.2 s |
| Notifications | Rappels natifs : discrets, ≤ 60, dans le futur, aucun pendant la période calme | réussi | 2.8 s |
| Santé Apple | Connexion, synchronisation sans doublon, déconnexion qui efface | réussi | 4.5 s |
| Santé Apple | Navigateur : aucune fausse connexion proposée | réussi | 1.0 s |
| Langues | Chaque langue : navigation traduite, aucune erreur | réussi | 9.6 s |
| Langues | Formats régionaux : dates et devise | réussi | 0.5 s |
| Accessibilité | Boutons et champs nommés, images décrites, sur tous les écrans | réussi | 1.6 s |
| Accessibilité | Cibles tactiles d’au moins 24 px (WCAG 2.2) sur les actions principales | réussi | 0.7 s |
| Affichage | Aucun débordement horizontal de 320 px à 1280 px, clair et sombre | réussi | 6.9 s |
| Performance | 3 ans d’historique, 4 addictions : chaque écran s’affiche en moins de 1,5 s | réussi | 1.8 s |
| Distribution | LIBRE.html autonome : fonctionne depuis un fichier, sans aucune requête externe | réussi | 0.8 s |
| Distribution | PWA : service worker actif et fonctionnement hors ligne | réussi | 1.4 s |
| Apparence | Couleurs d’accent : contraste des boutons ≥ 4,5:1 en clair et en sombre | réussi | 16.2 s |
| Apparence | Réglage : changer la couleur et couper les effets, conservé après rechargement | réussi | 2.6 s |
| Apparence | Moins d’animations demandé par le système : aucune animation d’écran | réussi | 2.1 s |
| Apparence | Animations actives : ouverture, entrée des blocs, barres qui se transforment | réussi | 3.7 s |
| Apparence | Carte principale (couleur et sombre) : texte blanc lisible (≥ 4,5:1 mesuré sur les pixels), 4 couleurs, clair et sombre | réussi | 21.4 s |
| Distribution | Page de présentation : sans erreur, sans requête externe, sans débordement, FR et EN | réussi | 1.3 s |
| Statistiques | Graphiques à parcourir : glisser le doigt ou les flèches affiche la valeur, puis le résumé revient | réussi | 4.0 s |
| Suivi | Modifier une consommation passée : quantité et heure changées, compteur recalculé, annulable | réussi | 3.5 s |
| Journal | Modifier une entrée, filtrer par humeur et par mois | réussi | 3.2 s |
| Outils | Favoris : ajouter un exercice, il apparaît en haut et reste après rechargement | réussi | 3.3 s |
| Suivi | Modifier puis supprimer un suivi : réglages enregistrés, suppression récupérable depuis la copie de sécurité | réussi | 4.0 s |
| Outils | SOS et les 8 exercices s’ouvrent, se lancent et se ferment sans erreur | réussi | 10.9 s |
| Suivi | Après un écart : le total des jours sans est mis en avant, pas un grand « 0 » (fr et en) | réussi | 3.9 s |

## Mesures de charge

12758 consommations, 1095 entrées de journal.

| Écran | Temps (ms) |
|---|---|
| démarrage | 480 |
| accueil | 66 |
| habitudes | 298 |
| stats | 291 |
| calendrier | 30 |
| bilans | 91 |
| outils | 31 |
| journal | 60 |
| envies | 66 |
| biblio | 15 |
| sante | 22 |
| profil | 75 |

## Non couvert ici

Ces tests simulent les plugins natifs (mêmes appels, mêmes réponses). Ils ne remplacent pas un essai sur un vrai iPhone et un vrai téléphone Android (voir docs/TESTS-APPAREILS.md) : chiffrement natif réel, HealthKit, notifications réelles, VoiceOver et TalkBack.
