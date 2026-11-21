# Résultats des tests automatisés

Exécutés le 2026-11-21 19:12 UTC, Chromium (Playwright), serveur local.

**54 réussis · 0 échoués · 0 non exécutés** sur 54.

| Groupe | Test | Résultat | Durée |
|---|---|---|---|
| Démarrage | L’accueil s’affiche sans erreur ni requête externe | réussi | 1.0 s |
| Inscription | Créer un profil « cigarettes » de bout en bout, puis le retrouver après rechargement | réussi | 4.4 s |
| Suivi | Noter une consommation remet le compteur à zéro et persiste | réussi | 1.0 s |
| Suivi | Plusieurs addictions : changer l’addiction principale | réussi | 0.8 s |
| Journal | Pagination par 30 et recherche sur toutes les entrées | réussi | 1.2 s |
| Sécurité | Code PIN : PBKDF2 600 000, sel aléatoire, jamais en clair | réussi | 2.7 s |
| Sécurité | Code PIN : 5 erreurs bloquent l’accès, même après rechargement | réussi | 7.5 s |
| Sécurité | Code PIN ancien format : accepté puis converti en PBKDF2 | réussi | 0.7 s |
| Sécurité | Navigateur : chiffrement facultatif par mot de passe (rien en clair, mot de passe exigé, désactivation, oubli sans perte) | réussi | 5.7 s |
| Sécurité | Navigateur chiffré : changer le mot de passe, et deux onglets ouverts qui ne s’écrasent pas | réussi | 6.0 s |
| Sauvegarde | Fichier chiffré modifié à la main : refusé, données actuelles intactes | réussi | 5.1 s |
| Sauvegarde | Export chiffré : aucun texte lisible, mauvais mot de passe refusé, restauration exacte | réussi | 5.4 s |
| Sauvegarde | Export sans mot de passe : demande une confirmation explicite | réussi | 2.2 s |
| Sauvegarde | Fichier d’une version future, fichier corrompu, fichier hostile | réussi | 4.4 s |
| Sauvegarde | Revenir à l’état d’avant une restauration | réussi | 3.3 s |
| Sauvegarde | Effacer toutes les données | réussi | 2.5 s |
| Natif | Coffre chiffré : migration des anciennes données, plus rien en clair | réussi | 1.3 s |
| Natif | Coffre illisible : le fichier est mis de côté, jamais écrasé | réussi | 1.9 s |
| Natif | Coffre momentanément inaccessible : LIBRE attend, n’écrit rien en clair, ne met rien de côté, puis rouvre les données | réussi | 1.0 s |
| Natif | Version store : pas de mode démo, pas de service worker, pas d’installation PWA | réussi | 1.1 s |
| Natif | Export et bilan : feuille de partage du système | réussi | 0.9 s |
| Natif | Bouton Retour Android : ferme la fenêtre, revient en arrière, puis réduit l’app | réussi | 1.1 s |
| Notifications | Rappels natifs : discrets, ≤ 60, dans le futur, aucun pendant la période calme | réussi | 2.8 s |
| Santé Apple | Connexion, synchronisation sans doublon, déconnexion qui efface | réussi | 4.5 s |
| Santé Apple | Navigateur : aucune fausse connexion proposée | réussi | 0.9 s |
| Langues | Chaque langue : navigation traduite, aucune erreur | réussi | 8.0 s |
| Langues | Lancement en 6 langues : seules les langues traduites sont proposées, les autres traductions restent dans le code | réussi | 2.0 s |
| Langues | Formats régionaux : dates et devise | réussi | 0.4 s |
| Accessibilité | Boutons et champs nommés, images décrites, sur tous les écrans | réussi | 1.7 s |
| Accessibilité | Cibles tactiles d’au moins 24 px (WCAG 2.2) sur les actions principales | réussi | 0.7 s |
| Affichage | Aucun débordement horizontal de 320 px à 1280 px, clair et sombre | réussi | 6.6 s |
| Performance | 3 ans d’historique, 4 addictions : chaque écran s’affiche en moins de 1,5 s | réussi | 2.0 s |
| Distribution | LIBRE.html autonome : fonctionne depuis un fichier, sans aucune requête externe | réussi | 0.8 s |
| Distribution | PWA : service worker actif et fonctionnement hors ligne | réussi | 1.3 s |
| Apparence | Couleurs d’accent : contraste des boutons ≥ 4,5:1 en clair et en sombre | réussi | 16.1 s |
| Apparence | Réglage : changer la couleur et couper les effets, conservé après rechargement | réussi | 2.5 s |
| Apparence | Moins d’animations demandé par le système : aucune animation d’écran | réussi | 2.1 s |
| Apparence | Animations actives : ouverture, entrée des blocs, barres qui se transforment | réussi | 3.8 s |
| Apparence | Carte principale (couleur et sombre) : texte blanc lisible (≥ 4,5:1 mesuré sur les pixels), 4 couleurs, clair et sombre | réussi | 22.4 s |
| Distribution | Page de présentation : sans erreur, sans requête externe, sans débordement, FR et EN | réussi | 1.4 s |
| Statistiques | Graphiques à parcourir : glisser le doigt ou les flèches affiche la valeur, puis le résumé revient | réussi | 4.1 s |
| Suivi | Modifier une consommation passée : quantité et heure changées, compteur recalculé, annulable | réussi | 3.5 s |
| Journal | Modifier une entrée, filtrer par humeur et par mois | réussi | 3.3 s |
| Outils | Favoris : ajouter un exercice, il apparaît en haut et reste après rechargement | réussi | 3.5 s |
| Suivi | Modifier puis supprimer un suivi : réglages enregistrés, suppression récupérable depuis la copie de sécurité | réussi | 4.4 s |
| Outils | SOS et les 8 exercices s’ouvrent, se lancent et se ferment sans erreur | réussi | 10.9 s |
| Calculs | Jours calendaires exacts malgré les changements d’heure, les années bissextiles et 4 fuseaux horaires | réussi | 7.7 s |
| Affichage | Barres d’onglets : aucun libellé coupé à 320 et 375 px, dans les 6 langues complètes | réussi | 47.1 s |
| Journal | Brouillon : un texte non enregistré revient après une fermeture accidentelle, jamais écrit sur l’appareil | réussi | 3.4 s |
| Accessibilité | Texte agrandi à 200 % (WCAG 1.4.4) : aucun écran ne déborde, en français et en allemand | réussi | 8.7 s |
| Performance | Téléphone modeste simulé (processeur 4× plus lent) : 12 000 consommations, 5 000 entrées de journal, données chiffrées | réussi | 17.0 s |
| Natif | Biométrie : cachée par défaut ; activée pour un essai, elle déverrouille sans remplacer le code (plugin simulé) | réussi | 6.0 s |
| Données | Données d’une version plus récente : lecture seule, rien n’est écrit par-dessus | réussi | 2.3 s |
| Suivi | Après un écart : le total des jours sans est mis en avant, pas un grand « 0 » (fr et en) | réussi | 3.8 s |

## Mesures de charge

12758 consommations, 1095 entrées de journal.

| Écran | Temps (ms) |
|---|---|
| démarrage | 504 |
| accueil | 47 |
| habitudes | 274 |
| stats | 265 |
| calendrier | 38 |
| bilans | 121 |
| outils | 30 |
| journal | 60 |
| envies | 70 |
| biblio | 21 |
| sante | 23 |
| profil | 241 |

## Téléphone modeste simulé (processeur 4× plus lent)

12 000 consommations, 5 000 entrées de journal ; données chiffrées : 2975 Ko.

| Action | Temps (ms) |
|---|---|
| démarrage (clair) | 1774 |
| habitudes | 1188 |
| stats | 1448 |
| calendrier | 212 |
| journal | 380 |
| outils | 169 |
| recherche journal | 223 |
| activer le chiffrement | 1768 |
| ouvrir les données chiffrées | 1513 |
| enregistrer une entrée (chiffrée) | 1626 |

## Non couvert ici

Ces tests simulent les plugins natifs (mêmes appels, mêmes réponses). Ils ne remplacent pas un essai sur un vrai iPhone et un vrai téléphone Android (voir docs/TESTS-APPAREILS.md) : chiffrement natif réel, HealthKit, notifications réelles, VoiceOver et TalkBack.
