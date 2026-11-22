# Résultats des tests automatisés

Exécutés le 2026-11-22 14:58 UTC, Chromium (Playwright), serveur local.

**88 réussis · 0 échoués · 0 non exécutés** sur 88.

| Groupe | Test | Résultat | Durée |
|---|---|---|---|
| Démarrage | L’accueil s’affiche sans erreur ni requête externe | réussi | 0.9 s |
| Inscription | Créer un profil « cigarettes » de bout en bout, puis le retrouver après rechargement | réussi | 4.1 s |
| Sécurité santé | Création d’un suivi « alcool » : l’avertissement de sevrage s’affiche avant de commencer, et pas pour les cigarettes | réussi | 6.0 s |
| Suivi | Noter une consommation remet le compteur à zéro et persiste | réussi | 0.9 s |
| Suivi | Plusieurs addictions : changer l’addiction principale | réussi | 0.6 s |
| Journal | Pagination par 30 et recherche sur toutes les entrées | réussi | 1.2 s |
| Sécurité | Code PIN : PBKDF2 600 000, sel aléatoire, jamais en clair | réussi | 2.5 s |
| Sécurité | Code PIN : 5 erreurs bloquent l’accès, même après rechargement | réussi | 7.1 s |
| Sécurité | Code PIN ancien format : accepté puis converti en PBKDF2 | réussi | 0.4 s |
| Sécurité | Navigateur : chiffrement facultatif par mot de passe (rien en clair, mot de passe exigé, désactivation, oubli sans perte) | réussi | 4.7 s |
| Sécurité | Navigateur chiffré : changer le mot de passe, et deux onglets ouverts qui ne s’écrasent pas | réussi | 5.5 s |
| Sauvegarde | Fichier chiffré modifié à la main : refusé, données actuelles intactes | réussi | 5.0 s |
| Sauvegarde | Export chiffré : aucun texte lisible, mauvais mot de passe refusé, restauration exacte | réussi | 5.1 s |
| Sauvegarde | Export sans mot de passe : demande une confirmation explicite | réussi | 2.0 s |
| Sauvegarde | Fichier d’une version future, fichier corrompu, fichier hostile | réussi | 4.1 s |
| Sauvegarde | Revenir à l’état d’avant une restauration | réussi | 3.2 s |
| Sauvegarde | Effacer toutes les données | réussi | 2.3 s |
| Natif | Coffre chiffré : migration des anciennes données, plus rien en clair | réussi | 0.9 s |
| Natif | Coffre illisible : le fichier est mis de côté, jamais écrasé | réussi | 1.8 s |
| Natif | Coffre momentanément inaccessible : LIBRE attend, n’écrit rien en clair, ne met rien de côté, puis rouvre les données | réussi | 0.9 s |
| Natif | Version store : pas de mode démo, pas de service worker, pas d’installation PWA | réussi | 1.0 s |
| Natif | Export et bilan : feuille de partage du système | réussi | 0.7 s |
| Natif | Bouton Retour Android : ferme la fenêtre, revient en arrière, puis réduit l’app | réussi | 1.1 s |
| Notifications | Rappels natifs : discrets, ≤ 60, dans le futur, aucun pendant la période calme | réussi | 2.7 s |
| Santé Apple | Connexion, synchronisation sans doublon, déconnexion qui efface | réussi | 4.3 s |
| Santé Apple | Navigateur : aucune fausse connexion proposée | réussi | 0.8 s |
| Langues | Chaque langue : navigation traduite, aucune erreur | réussi | 5.9 s |
| Langues | Lancement en 6 langues : seules les langues traduites sont proposées, les autres traductions restent dans le code | réussi | 1.9 s |
| Langues | Formats régionaux : dates et devise | réussi | 0.2 s |
| Accessibilité | Boutons et champs nommés, images décrites, sur tous les écrans | réussi | 1.4 s |
| Accessibilité | Cibles tactiles d’au moins 24 px (WCAG 2.2) sur les actions principales | réussi | 0.6 s |
| Affichage | Aucun débordement horizontal de 320 px à 1280 px, clair et sombre | réussi | 5.3 s |
| Performance | 3 ans d’historique, 4 addictions : chaque écran s’affiche en moins de 1,5 s | réussi | 1.1 s |
| Distribution | LIBRE.html autonome : fonctionne depuis un fichier, sans aucune requête externe | réussi | 0.7 s |
| Distribution | PWA : service worker actif et fonctionnement hors ligne | réussi | 1.0 s |
| Apparence | Couleurs d’accent : contraste des boutons ≥ 4,5:1 en clair et en sombre | réussi | 15.1 s |
| Apparence | Réglage : changer la couleur et activer les effets (verre), conservé après rechargement | réussi | 2.5 s |
| Apparence | Moins d’animations demandé par le système : aucune animation d’écran | réussi | 1.9 s |
| Apparence | Option « verre » : animations d’ouverture, entrée des blocs, barres qui se transforment | réussi | 3.7 s |
| Apparence | Carte principale (couleur et sombre) : texte blanc lisible (≥ 4,5:1 mesuré sur les pixels), 4 couleurs, clair et sombre | réussi | 19.5 s |
| Distribution | Page de présentation : sans erreur, sans requête externe, sans débordement, FR et EN | réussi | 1.3 s |
| Statistiques | Graphiques à parcourir : glisser le doigt ou les flèches affiche la valeur, puis le résumé revient | réussi | 4.0 s |
| Suivi | Modifier une consommation passée : quantité et heure changées, compteur recalculé, annulable | réussi | 3.4 s |
| Journal | Modifier une entrée, filtrer par humeur et par mois | réussi | 3.1 s |
| Outils | Favoris : ajouter un exercice, il apparaît en haut et reste après rechargement | réussi | 3.1 s |
| Suivi | Modifier puis supprimer un suivi : réglages enregistrés, suppression récupérable depuis la copie de sécurité | réussi | 3.7 s |
| Outils | SOS et les 8 exercices s’ouvrent, se lancent et se ferment sans erreur | réussi | 10.7 s |
| Calculs | Jours calendaires exacts malgré les changements d’heure, les années bissextiles et 4 fuseaux horaires | réussi | 7.2 s |
| Affichage | Barres d’onglets : aucun libellé coupé à 320 et 375 px, dans les 6 langues complètes | réussi | 45.7 s |
| Journal | Brouillon : un texte non enregistré revient après une fermeture accidentelle, jamais écrit sur l’appareil | réussi | 3.0 s |
| Accessibilité | Texte agrandi à 200 % (WCAG 1.4.4) : aucun écran ne déborde, en français et en allemand | réussi | 8.3 s |
| Performance | Téléphone modeste simulé (processeur 4× plus lent) : 12 000 consommations, 5 000 entrées de journal, données chiffrées | réussi | 12.4 s |
| Natif | Biométrie : cachée par défaut ; activée pour un essai, elle déverrouille sans remplacer le code (plugin simulé) | réussi | 5.6 s |
| Données | Données d’une version plus récente : lecture seule, rien n’est écrit par-dessus | réussi | 2.2 s |
| Aide | Pays absent de la table (Luxembourg) : jamais les numéros d’un autre pays, numéro d’urgence local et choix du pays | réussi | 1.8 s |
| Aide | Suisse : numéros affichés avec la date de revérification ; pays non revérifié : avertissement | réussi | 3.8 s |
| Sauvegarde | Tout effacer : la copie de sécurité est annoncée et peut être supprimée ; les copies mises de côté sont effacées | réussi | 2.5 s |
| Affichage | Calendrier à 320 px : l’en-tête « ‹ mois › » reste sur une ligne (fr, it, de) | réussi | 5.7 s |
| Sécurité | Politique de sécurité (CSP) : aucune violation en parcourant l’app, et toute connexion vers un serveur extérieur est bloquée | réussi | 3.2 s |
| Aide | Jeux d’argent : la ligne spécialisée du pays n’apparaît que si cette habitude est suivie | réussi | 4.2 s |
| Parcours 1 | Découverte : objectif « mieux comprendre », difficultés et accompagnement choisis ; ni âge, ni sexe, ni taille, ni poids demandés ; accueil sans compteur d’abstinence | réussi | 4.7 s |
| Suivi | Réduction : le bloc principal montre la moyenne sur 7 jours et ce qui reste, jamais un compteur « jours sans » | réussi | 1.8 s |
| Parcours 5 | Journée difficile : pistes simples, objectif allégé pour la journée puis rétabli, numéro d’urgence du pays proposé | réussi | 2.9 s |
| Parcours 3 | Envie forte : aide guidée en 7 étapes (ressenti, intensité, contexte, stratégie adaptée, exercice, bilan, enregistrement) | réussi | 3.9 s |
| Personnalisation | Conseils personnalisés : désactivables dans le profil ; les messages de sécurité restent (alcool, premiers jours) | réussi | 4.0 s |
| Aide | Numéros groupés par situation ; LIBRE n’est pas un service d’urgence ; Suisse : ligne jeu excessif 0800 040 080 si l’habitude est suivie | réussi | 2.1 s |
| Parcours 11 | Notifications refusées dans le téléphone : rien n’est programmé, un message clair, l’app reste entièrement utilisable | réussi | 2.8 s |
| Apparence | Identité « Encre » par défaut, y compris pour les profils existants ; l’ancien style « verre » reste une option | réussi | 2.3 s |
| Aide | Triage : « De quoi as-tu besoin ? » propose 4 besoins ; chacun mène au bon outil (aide guidée, respiration, proche, urgences) | réussi | 3.7 s |
| Personnalisation | Moment à risque : signalé à l’heure où la personne consomme le plus souvent, avec son explication ; absent si les conseils sont désactivés | réussi | 3.5 s |
| Soutien | Centre de soutien : maintenant, 7 situations (3 gestes, un exercice, un plan, une lecture), exercices, plans, orientation | réussi | 3.5 s |
| Soutien | Fiche interactive : gestes cochés, « Ça t’a aidé ? » enregistré, puis proposé dans « Ce qui t’aide » ; une reprise mène à la fiche de son déclencheur | réussi | 3.7 s |
| Navigation | Barre Aujourd’hui · Soutien · Progrès (statistiques d’abord) · Journal ; bouton « Aide » dans l’en-tête de chaque page ; le profil s’ouvre depuis l’avatar | réussi | 4.0 s |
| Journal | Écriture guidée : une question du jour, émotions, pensée, intention pour demain ; tout est enregistré et réaffiché | réussi | 2.6 s |
| Statistiques | Lecture expliquée : constats en phrases simples, chacun avec son mode de calcul ; jamais présentés comme un diagnostic | réussi | 3.9 s |
| Bibliothèque | Par thèmes : 11 thèmes avec un objectif pédagogique, chaque fiche s’ouvre ; un thème sans fiche dédiée le dit | réussi | 5.7 s |
| Parcours 2 | Tableau de bord adaptatif : premiers pas, moment difficile, reprise, objectif atteint (une seule carte, la plus importante) | réussi | 9.0 s |
| Parcours 4 | Exercice guidé (surfer sur l’envie) : démarrer, terminer, indiquer le résultat ; la séance est enregistrée | réussi | 3.2 s |
| Parcours 6 | Rechute : la feuille rappelle ce qui reste acquis, la reprise est notée sans culpabiliser, la suite est préparée | réussi | 2.7 s |
| Parcours 8 | Modifier son objectif : passer d’« arrêter » à « mieux comprendre » ; le compteur d’abstinence disparaît, les données restent | réussi | 2.8 s |
| Plans | Plans par situation : un modèle « Pression sociale » remplit le plan, modifiable, puis enregistré et visible | réussi | 2.6 s |
| Confidentialité | Voile : dès que LIBRE passe en arrière-plan, le contenu est masqué, puis réapparaît au retour | réussi | 1.9 s |
| Confidentialité | Tout effacer annule les rappels déjà programmés dans le téléphone, et rien ne réapparaît après réouverture | réussi | 3.8 s |
| Exports | Bilan mensuel : journal et habitude contenant du HTML et du JavaScript, rien ne s’exécute ; nom de fichier sans donnée personnelle | réussi | 2.5 s |
| Santé Apple | États exacts : « autorisation demandée, aucune donnée », synchronisation incomplète signalée, resynchronisation sur 7 jours (plugin simulé) | réussi | 3.9 s |
| Données | Migration : un état de la version 3 (sans marqueur dataV) est relu sans perte, puis marqué dataV 3 | réussi | 2.3 s |
| Scénario | Nouveau téléphone : profil complet, export chiffré, restauration dans un autre navigateur vierge, tout est identique | réussi | 6.0 s |
| Suivi | Après un écart : le total des jours sans est mis en avant, pas un grand « 0 » (fr et en) | réussi | 3.6 s |

## Mesures de charge

12758 consommations, 1095 entrées de journal.

| Écran | Temps (ms) |
|---|---|
| démarrage | 288 |
| accueil | 21 |
| habitudes | 201 |
| stats | 203 |
| calendrier | 31 |
| bilans | 64 |
| outils | 17 |
| journal | 41 |
| envies | 7 |
| biblio | 16 |
| sante | 15 |
| profil | 25 |

## Téléphone modeste simulé (processeur 4× plus lent)

12 000 consommations, 5 000 entrées de journal ; données chiffrées : 2975 Ko.

| Action | Temps (ms) |
|---|---|
| démarrage (clair) | 1246 |
| habitudes | 916 |
| stats | 984 |
| calendrier | 188 |
| journal | 275 |
| outils | 142 |
| recherche journal | 204 |
| activer le chiffrement | 1143 |
| ouvrir les données chiffrées | 788 |
| enregistrer une entrée (chiffrée) | 602 |

## Non couvert ici

Ces tests simulent les plugins natifs (mêmes appels, mêmes réponses). Ils ne remplacent pas un essai sur un vrai iPhone et un vrai téléphone Android (voir docs/TESTS-APPAREILS.md) : chiffrement natif réel, HealthKit, notifications réelles, VoiceOver et TalkBack.
