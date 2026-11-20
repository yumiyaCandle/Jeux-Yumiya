# Résultats des tests automatisés

Exécutés le 2026-11-20 22:08 UTC, Chromium (Playwright), serveur local.

**29 réussis · 0 échoués · 0 non exécutés** sur 29.

| Groupe | Test | Résultat | Durée |
|---|---|---|---|
| Démarrage | L’accueil s’affiche sans erreur ni requête externe | réussi | 0.9 s |
| Inscription | Créer un profil « cigarettes » de bout en bout, puis le retrouver après rechargement | réussi | 4.0 s |
| Suivi | Noter une consommation remet le compteur à zéro et persiste | réussi | 0.8 s |
| Suivi | Plusieurs addictions : changer l’addiction principale | réussi | 0.6 s |
| Journal | Pagination par 30 et recherche sur toutes les entrées | réussi | 1.1 s |
| Sécurité | Code PIN : PBKDF2 600 000, sel aléatoire, jamais en clair | réussi | 2.4 s |
| Sécurité | Code PIN : 5 erreurs bloquent l’accès, même après rechargement | réussi | 7.0 s |
| Sécurité | Code PIN ancien format : accepté puis converti en PBKDF2 | réussi | 0.4 s |
| Sauvegarde | Export chiffré : aucun texte lisible, mauvais mot de passe refusé, restauration exacte | réussi | 5.0 s |
| Sauvegarde | Export sans mot de passe : demande une confirmation explicite | réussi | 2.0 s |
| Sauvegarde | Fichier d’une version future, fichier corrompu, fichier hostile | réussi | 4.1 s |
| Sauvegarde | Revenir à l’état d’avant une restauration | réussi | 1.6 s |
| Sauvegarde | Effacer toutes les données | réussi | 2.3 s |
| Natif | Coffre chiffré : migration des anciennes données, plus rien en clair | réussi | 0.9 s |
| Natif | Coffre illisible : le fichier est mis de côté, jamais écrasé | réussi | 1.8 s |
| Natif | Version store : pas de mode démo, pas de service worker, pas d’installation PWA | réussi | 1.0 s |
| Natif | Export et bilan : feuille de partage du système | réussi | 0.7 s |
| Natif | Bouton Retour Android : ferme la fenêtre, revient en arrière, puis réduit l’app | réussi | 1.1 s |
| Notifications | Rappels natifs : discrets, ≤ 60, dans le futur, aucun pendant la période calme | réussi | 2.7 s |
| Santé Apple | Connexion, synchronisation sans doublon, déconnexion qui efface | réussi | 4.3 s |
| Santé Apple | Navigateur : aucune fausse connexion proposée | réussi | 0.8 s |
| Langues | Chaque langue : navigation traduite, aucune erreur | réussi | 5.9 s |
| Langues | Formats régionaux : dates et devise | réussi | 0.2 s |
| Accessibilité | Boutons et champs nommés, images décrites, sur tous les écrans | réussi | 1.3 s |
| Accessibilité | Cibles tactiles d’au moins 24 px (WCAG 2.2) sur les actions principales | réussi | 0.5 s |
| Affichage | Aucun débordement horizontal de 320 px à 1280 px, clair et sombre | réussi | 5.2 s |
| Performance | 3 ans d’historique, 4 addictions : chaque écran s’affiche en moins de 1,5 s | réussi | 1.2 s |
| Distribution | LIBRE.html autonome : fonctionne depuis un fichier, sans aucune requête externe | réussi | 0.7 s |
| Distribution | PWA : service worker actif et fonctionnement hors ligne | réussi | 1.0 s |

## Mesures de charge

12758 consommations, 1095 entrées de journal.

| Écran | Temps (ms) |
|---|---|
| démarrage | 300 |
| accueil | 33 |
| habitudes | 245 |
| stats | 240 |
| calendrier | 34 |
| bilans | 71 |
| outils | 8 |
| journal | 30 |
| envies | 12 |
| biblio | 15 |
| sante | 20 |
| profil | 55 |

## Non couvert ici

Ces tests simulent les plugins natifs (mêmes appels, mêmes réponses). Ils ne remplacent pas un essai sur un vrai iPhone et un vrai téléphone Android (voir docs/TESTS-APPAREILS.md) : chiffrement natif réel, HealthKit, notifications réelles, VoiceOver et TalkBack.
