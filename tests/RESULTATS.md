# Résultats des tests automatisés

Exécutés le 2026-11-26 14:48 UTC, Chromium (Playwright), serveur local.

**12 réussis · 102 échoués · 0 non exécutés** sur 114.

| Groupe | Test | Résultat | Durée |
|---|---|---|---|
| Démarrage | L’accueil s’affiche sans erreur ni requête externe | réussi | 1.0 s |
| Inscription | Créer un profil « cigarettes » de bout en bout, puis le retrouver après rechargement | réussi | 4.7 s |
| Sécurité santé | Création d’un suivi « alcool » : l’avertissement de sevrage s’affiche avant de commencer, et pas pour les cigarettes | réussi | 6.4 s |
| Suivi | Noter une consommation remet le compteur à zéro et persiste | réussi | 1.2 s |
| Suivi | Plusieurs addictions : changer l’addiction principale | réussi | 0.9 s |
| Journal | Pagination par 30 et recherche sur toutes les entrées | réussi | 1.4 s |
| Sécurité | Code PIN : PBKDF2 600 000, sel aléatoire, jamais en clair | réussi | 2.8 s |
| Sécurité | Code PIN : 5 erreurs bloquent l’accès, même après rechargement | réussi | 7.5 s |
| Sécurité | Code PIN ancien format : accepté puis converti en PBKDF2 | réussi | 0.6 s |
| Sécurité | Navigateur : chiffrement facultatif par mot de passe (rien en clair, mot de passe exigé, désactivation, oubli sans perte) | réussi | 5.5 s |
| Sécurité | Navigateur chiffré : changer le mot de passe, et deux onglets ouverts qui ne s’écrasent pas | réussi | 6.3 s |
| Sauvegarde | Fichier chiffré modifié à la main : refusé, données actuelles intactes | réussi | 5.2 s |
| Sauvegarde | Export chiffré : aucun texte lisible, mauvais mot de passe refusé, restauration exacte | échoué : page.click: Target page, context or browser has been closed Call log: [2m  - waiting for locator('[data-a="exportFile"]')[22m | 2.1 s |
| Sauvegarde | Export sans mot de passe : demande une confirmation explicite | échoué : browser.newContext: Target page, context or browser has been closed Browser logs:  | 0.0 s |
| Sauvegarde | Fichier d’une version future, fichier corrompu, fichier hostile | échoué : browser.newContext: Target page, context or browser has been closed | 0.0 s |
| Sauvegarde | Revenir à l’état d’avant une restauration | échoué : browser.newContext: Target page, context or browser has been closed | 0.0 s |
| Sauvegarde | Effacer toutes les données | échoué : browser.newContext: Target page, context or browser has been closed | 0.0 s |
| Natif | Coffre chiffré : migration des anciennes données, plus rien en clair | échoué : browser.newContext: Target page, context or browser has been closed | 0.0 s |
| Natif | Coffre illisible : le fichier est mis de côté, jamais écrasé | échoué : browser.newContext: Target page, context or browser has been closed | 0.0 s |
| Natif | Coffre momentanément inaccessible : LIBRE attend, n’écrit rien en clair, ne met rien de côté, puis rouvre les données | échoué : browser.newContext: Target page, context or browser has been closed | 0.0 s |
| Natif | Version store : pas de mode démo, pas de service worker, pas d’installation PWA | échoué : browser.newContext: Target page, context or browser has been closed | 0.0 s |
| Natif | Export et bilan : feuille de partage du système | échoué : browser.newContext: Target page, context or browser has been closed | 0.0 s |
| Natif | Bouton Retour Android : ferme la fenêtre, revient en arrière, puis réduit l’app | échoué : browser.newContext: Target page, context or browser has been closed | 0.0 s |
| Notifications | Rappels natifs : discrets, ≤ 60, dans le futur, aucun pendant la période calme | échoué : browser.newContext: Target page, context or browser has been closed | 0.0 s |
| Santé Apple | Connexion, synchronisation sans doublon, déconnexion qui efface | échoué : browser.newContext: Target page, context or browser has been closed | 0.0 s |
| Santé Apple | Navigateur : aucune fausse connexion proposée | échoué : browser.newContext: Target page, context or browser has been closed | 0.0 s |
| Langues | Chaque langue : navigation traduite, aucune erreur | échoué : browser.newContext: Target page, context or browser has been closed | 0.0 s |
| Langues | Lancement en 6 langues : seules les langues traduites sont proposées, les autres traductions restent dans le code | échoué : browser.newContext: Target page, context or browser has been closed | 0.0 s |
| Langues | Formats régionaux : dates et devise | échoué : browser.newContext: Target page, context or browser has been closed | 0.0 s |
| Accessibilité | Boutons et champs nommés, images décrites, sur tous les écrans | échoué : browser.newContext: Target page, context or browser has been closed | 0.0 s |
| Accessibilité | Cibles tactiles d’au moins 24 px (WCAG 2.2) sur les actions principales | échoué : browser.newContext: Target page, context or browser has been closed | 0.0 s |
| Affichage | Aucun débordement horizontal de 320 px à 1280 px, clair et sombre | échoué : browser.newContext: Target page, context or browser has been closed | 0.0 s |
| Performance | 3 ans d’historique, 4 addictions : chaque écran s’affiche en moins de 1,5 s | échoué : browser.newContext: Target page, context or browser has been closed | 0.0 s |
| Distribution | LIBRE.html autonome : fonctionne depuis un fichier, sans aucune requête externe | échoué : browser.newContext: Target page, context or browser has been closed | 0.0 s |
| Distribution | PWA : service worker actif et fonctionnement hors ligne | échoué : browser.newContext: Target page, context or browser has been closed | 0.0 s |
| Apparence | Couleurs d’accent : contraste des boutons ≥ 4,5:1 en clair et en sombre | échoué : browser.newContext: Target page, context or browser has been closed | 0.0 s |
| Apparence | Réglage : changer la couleur et activer les effets (verre), conservé après rechargement | échoué : browser.newContext: Target page, context or browser has been closed | 0.0 s |
| Apparence | Moins d’animations demandé par le système : aucune animation d’écran | échoué : browser.newContext: Target page, context or browser has been closed | 0.0 s |
| Apparence | Option « verre » : animations d’ouverture, entrée des blocs, barres qui se transforment | échoué : browser.newContext: Target page, context or browser has been closed | 0.0 s |
| Apparence | Ton chemin (bloc principal) : chaque texte lisible sur son fond réel (≥ 4,5:1 mesuré sur les pixels), clair et sombre, toutes les couleurs d’accent | échoué : browser.newContext: Target page, context or browser has been closed | 0.0 s |
| Distribution | Page de présentation : sans erreur, sans requête externe, sans débordement, FR et EN | échoué : browser.newContext: Target page, context or browser has been closed | 0.0 s |
| Statistiques | Graphiques à parcourir : glisser le doigt ou les flèches affiche la valeur, puis le résumé revient | échoué : browser.newContext: Target page, context or browser has been closed | 0.0 s |
| Suivi | Modifier une consommation passée : quantité et heure changées, compteur recalculé, annulable | échoué : browser.newContext: Target page, context or browser has been closed | 0.0 s |
| Journal | Modifier une entrée, filtrer par humeur et par mois | échoué : browser.newContext: Target page, context or browser has been closed | 0.0 s |
| Outils | Favoris : ajouter un exercice, il apparaît en haut et reste après rechargement | échoué : browser.newContext: Target page, context or browser has been closed | 0.0 s |
| Suivi | Modifier puis supprimer un suivi : réglages enregistrés, suppression récupérable depuis la copie de sécurité | échoué : browser.newContext: Target page, context or browser has been closed | 0.0 s |
| Outils | SOS et les 8 exercices s’ouvrent, se lancent et se ferment sans erreur | échoué : browser.newContext: Target page, context or browser has been closed | 0.0 s |
| Calculs | Jours calendaires exacts malgré les changements d’heure, les années bissextiles et 4 fuseaux horaires | échoué : browser.newContext: Target page, context or browser has been closed | 0.0 s |
| Affichage | Barres d’onglets : aucun libellé coupé à 320 et 375 px, dans les 6 langues complètes | échoué : browser.newContext: Target page, context or browser has been closed | 0.0 s |
| Journal | Brouillon : un texte non enregistré revient après une fermeture accidentelle, jamais écrit sur l’appareil | échoué : browser.newContext: Target page, context or browser has been closed | 0.0 s |
| Accessibilité | Texte agrandi à 200 % (WCAG 1.4.4) : aucun écran ne déborde, en français et en allemand | échoué : browser.newContext: Target page, context or browser has been closed | 0.0 s |
| Performance | Téléphone modeste simulé (processeur 4× plus lent) : 12 000 consommations, 5 000 entrées de journal, données chiffrées | échoué : browser.newContext: Target page, context or browser has been closed | 0.0 s |
| Natif | Biométrie : cachée par défaut ; activée pour un essai, elle déverrouille sans remplacer le code (plugin simulé) | échoué : browser.newContext: Target page, context or browser has been closed | 0.0 s |
| Données | Données d’une version plus récente : lecture seule, rien n’est écrit par-dessus | échoué : browser.newContext: Target page, context or browser has been closed | 0.0 s |
| Aide | Pays absent de la table (Luxembourg) : jamais les numéros d’un autre pays, numéro d’urgence local et choix du pays | échoué : browser.newContext: Target page, context or browser has been closed | 0.0 s |
| Aide | Suisse : numéros affichés avec la date de revérification ; pays non revérifié : avertissement | échoué : browser.newContext: Target page, context or browser has been closed | 0.0 s |
| Sauvegarde | Tout effacer : la copie de sécurité est annoncée et peut être supprimée ; les copies mises de côté sont effacées | échoué : browser.newContext: Target page, context or browser has been closed | 0.0 s |
| Affichage | Calendrier à 320 px : l’en-tête « ‹ mois › » reste sur une ligne (fr, it, de) | échoué : browser.newContext: Target page, context or browser has been closed | 0.0 s |
| Sécurité | Politique de sécurité (CSP) : aucune violation en parcourant l’app, et toute connexion vers un serveur extérieur est bloquée | échoué : browser.newContext: Target page, context or browser has been closed | 0.0 s |
| Aide | Jeux d’argent : la ligne spécialisée du pays n’apparaît que si cette habitude est suivie | échoué : browser.newContext: Target page, context or browser has been closed | 0.0 s |
| Parcours 1 | Découverte : objectif « mieux comprendre », difficultés et accompagnement choisis ; ni âge, ni sexe, ni taille, ni poids demandés ; accueil sans compteur d’abstinence | échoué : browser.newContext: Target page, context or browser has been closed | 0.0 s |
| Suivi | Réduction : le bloc principal montre la moyenne sur 7 jours et ce qui reste, jamais un compteur « jours sans » | échoué : browser.newContext: Target page, context or browser has been closed | 0.0 s |
| Parcours 5 | Journée difficile : pistes simples, objectif allégé pour la journée puis rétabli, numéro d’urgence du pays proposé | échoué : browser.newContext: Target page, context or browser has been closed | 0.0 s |
| Parcours 3 | Envie forte : aide guidée en 7 étapes (ressenti, intensité, contexte, stratégie adaptée, exercice, bilan, enregistrement) | échoué : browser.newContext: Target page, context or browser has been closed | 0.0 s |
| Personnalisation | Conseils personnalisés : désactivables dans le profil ; les messages de sécurité restent (alcool, premiers jours) | échoué : browser.newContext: Target page, context or browser has been closed | 0.0 s |
| Aide | Numéros groupés par situation ; LIBRE n’est pas un service d’urgence ; Suisse : ligne jeu excessif 0800 040 080 si l’habitude est suivie | échoué : browser.newContext: Target page, context or browser has been closed | 0.0 s |
| Parcours 11 | Notifications refusées dans le téléphone : rien n’est programmé, un message clair, l’app reste entièrement utilisable | échoué : browser.newContext: Target page, context or browser has been closed | 0.0 s |
| Apparence | Identité « Envol » par défaut, y compris pour les profils existants ; l’ancien style « verre » reste une option | échoué : browser.newContext: Target page, context or browser has been closed | 0.0 s |
| Apparence | Couleur par addiction : un suivi, plusieurs suivis, changement de sélection mémorisé, vues mélangées en couleur commune | échoué : browser.newContext: Target page, context or browser has been closed | 0.0 s |
| Apparence | Couleur par addiction : personnalisée, conservée après réouverture, désactivable ; contrastes AA de toutes les palettes (clair et sombre) | échoué : browser.newContext: Target page, context or browser has been closed | 0.0 s |
| Aide | Triage : « De quoi as-tu besoin ? » propose 4 besoins ; chacun mène au bon outil (aide guidée, respiration, proche, urgences) | échoué : browser.newContext: Target page, context or browser has been closed | 0.0 s |
| Personnalisation | Moment à risque : signalé à l’heure où la personne consomme le plus souvent, avec son explication ; absent si les conseils sont désactivés | échoué : browser.newContext: Target page, context or browser has been closed | 0.0 s |
| Soutien | Centre de soutien : maintenant, 7 situations (3 gestes, un exercice, un plan, une lecture), exercices, plans, orientation | échoué : browser.newContext: Target page, context or browser has been closed | 0.0 s |
| Soutien | Fiche interactive : gestes cochés, « Ça t’a aidé ? » enregistré, puis proposé dans « Ce qui t’aide » ; une reprise mène à la fiche de son déclencheur | échoué : browser.newContext: Target page, context or browser has been closed | 0.0 s |
| Navigation | Barre Aujourd’hui · Soutien · Parcours (statistiques d’abord) · Journal + bouton Aide séparé (verre liquide) sur chaque page ; le profil s’ouvre depuis l’avatar | échoué : browser.newContext: Target page, context or browser has been closed | 0.0 s |
| Journal | Écriture guidée : une question du jour, émotions, pensée, intention pour demain ; tout est enregistré et réaffiché | échoué : browser.newContext: Target page, context or browser has been closed | 0.0 s |
| Statistiques | Lecture expliquée : constats en phrases simples, chacun avec son mode de calcul ; jamais présentés comme un diagnostic | échoué : browser.newContext: Target page, context or browser has been closed | 0.0 s |
| Bibliothèque | Par thèmes : 11 thèmes avec un objectif pédagogique, chaque fiche s’ouvre ; un thème sans fiche dédiée le dit | échoué : browser.newContext: Target page, context or browser has been closed | 0.0 s |
| Parcours 2 | Tableau de bord adaptatif : premiers pas, moment difficile, reprise, objectif atteint (une seule carte, la plus importante) | échoué : browser.newContext: Target page, context or browser has been closed | 0.0 s |
| Parcours 4 | Exercice guidé (surfer sur l’envie) : démarrer, terminer, indiquer le résultat ; la séance est enregistrée | échoué : browser.newContext: Target page, context or browser has been closed | 0.0 s |
| Parcours 6 | Rechute : la feuille rappelle ce qui reste acquis, la reprise est notée sans culpabiliser, la suite est préparée | échoué : browser.newContext: Target page, context or browser has been closed | 0.0 s |
| Parcours 8 | Modifier son objectif : passer d’« arrêter » à « mieux comprendre » ; le compteur d’abstinence disparaît, les données restent | échoué : browser.newContext: Target page, context or browser has been closed | 0.0 s |
| Plans | Plans par situation : un modèle « Pression sociale » remplit le plan, modifiable, puis enregistré et visible | échoué : browser.newContext: Target page, context or browser has been closed | 0.0 s |
| Confidentialité | Voile : dès que LIBRE passe en arrière-plan, le contenu est masqué, puis réapparaît au retour | échoué : browser.newContext: Target page, context or browser has been closed | 0.0 s |
| Confidentialité | Tout effacer annule les rappels déjà programmés dans le téléphone, et rien ne réapparaît après réouverture | échoué : browser.newContext: Target page, context or browser has been closed | 0.0 s |
| Exports | Bilan mensuel : journal et habitude contenant du HTML et du JavaScript, rien ne s’exécute ; nom de fichier sans donnée personnelle | échoué : browser.newContext: Target page, context or browser has been closed | 0.0 s |
| Santé Apple | États exacts : « autorisation demandée, aucune donnée », synchronisation incomplète signalée, resynchronisation sur 7 jours (plugin simulé) | échoué : browser.newContext: Target page, context or browser has been closed | 0.0 s |
| Données | Migration : un état de la version 3 (sans marqueur dataV) est relu sans perte, puis marqué dataV 3 | échoué : browser.newContext: Target page, context or browser has been closed | 0.0 s |
| Scénario | Nouveau téléphone : profil complet, export chiffré, restauration dans un autre navigateur vierge, tout est identique | échoué : browser.newContext: Target page, context or browser has been closed | 0.0 s |
| Suivi | Après un écart : le total des jours sans est mis en avant, pas un grand « 0 » (fr et en) | échoué : browser.newContext: Target page, context or browser has been closed | 0.0 s |
| Accueil en chiffres | Les cartes donnent les bons chiffres et s’adaptent à l’addiction (arrêt / réduction) | échoué : browser.newContext: Target page, context or browser has been closed | 0.0 s |
| Accueil en chiffres | Personnaliser : masquer une carte et changer l’ordre, mémorisé après rechargement | échoué : browser.newContext: Target page, context or browser has been closed | 0.0 s |
| Recherche | La recherche trouve articles, exercices, SOS et réglages, et y mène en un toucher | échoué : browser.newContext: Target page, context or browser has been closed | 0.0 s |
| Mode discret | Masque les noms des addictions et brouille les chiffres ; mémorisé | échoué : browser.newContext: Target page, context or browser has been closed | 0.0 s |
| Historique | La frise liste consommations, étapes et début du suivi, avec filtres | échoué : browser.newContext: Target page, context or browser has been closed | 0.0 s |
| Favoris | Un article ajouté aux favoris apparaît en tête de la bibliothèque et dans la recherche | échoué : browser.newContext: Target page, context or browser has been closed | 0.0 s |
| Notifications | Nouveaux rappels (résumé, encouragement, inactivité) : choix, heure, programmés sans culpabiliser | échoué : browser.newContext: Target page, context or browser has been closed | 0.0 s |
| Profil | Le profil est rangé en 9 catégories | échoué : browser.newContext: Target page, context or browser has been closed | 0.0 s |
| Langue | Le bouton de langue en haut de l’accueil change toute l’application immédiatement | échoué : browser.newContext: Target page, context or browser has been closed | 0.0 s |
| Mon coach | Bilan calculé sur les vraies données, objectifs du jour, défis, conseils selon les déclencheurs, avertissement | échoué : browser.newContext: Target page, context or browser has been closed | 0.0 s |
| Programme 30 jours | Démarrer, faire une mission avec une note, rattraper un jour, recommencer sans perdre les badges | échoué : browser.newContext: Target page, context or browser has been closed | 0.0 s |
| Récompenses | Points d’effort recalculés, badges datés, une reprise ne retire rien, objectifs personnels | échoué : browser.newContext: Target page, context or browser has been closed | 0.0 s |
| Mes motivations | Ajouter objectifs, phrases, souvenirs datés, liste à accomplir, photo réduite ; affichage à l’accueil et accès depuis le SOS | échoué : browser.newContext: Target page, context or browser has been closed | 0.0 s |
| Comprendre mon addiction | 9 catégories, 6 rubriques, avertissement sevrage alcool, sources existantes, aide | échoué : browser.newContext: Target page, context or browser has been closed | 0.0 s |
| Mon évolution | Graphiques semaine et mois calculés, comparaison au mois précédent, envies, humeur, difficultés | échoué : browser.newContext: Target page, context or browser has been closed | 0.0 s |
| Plan de prévention | Émotions, activités de remplacement et plan en cas de reprise enregistrés | échoué : browser.newContext: Target page, context or browser has been closed | 0.0 s |
| Données | Anciennes sauvegardes sans les nouvelles rubriques, et rubriques corrompues : relues sans erreur ni perte | échoué : browser.newContext: Target page, context or browser has been closed | 0.0 s |
| Interface | Ordinateur : barre latérale en verre (sections, suivis avec compteur, Ctrl+K, repli mémorisé), héros de la semaine et carte du jour calculés | échoué : browser.newContext: Target page, context or browser has been closed | 0.0 s |
| Interface | Téléphone : la barre du bas garde 4 onglets et l’Aide ; les entrées de la barre latérale restent cachées | échoué : browser.newContext: Target page, context or browser has been closed | 0.0 s |
| Tableau de bord | Vue d’ensemble : chiffres clés justes, période 3/6/12 mois, bulle au toucher, moments marquants qui ouvrent une fiche | échoué : browser.newContext: Target page, context or browser has been closed | 0.0 s |
| Tableau de bord | Stratégies (ordinateur) : ajouter, idée en un toucher, essayer, avancer d’étape (et glisser-déposer), « Ça m’aide » rejoint le plan | échoué : browser.newContext: Target page, context or browser has been closed | 0.0 s |
| Tableau de bord | Déclencheurs : annuaire calculé (fréquence, intensité, part traversée) et fiche avec historique, plan « si… alors… » prérempli | échoué : browser.newContext: Target page, context or browser has been closed | 0.0 s |
| Tableau de bord | Économies : total, mois, courbe, dépenses, relevé du mois avec tampon et choix du mois ; rien n’est envoyé | échoué : browser.newContext: Target page, context or browser has been closed | 0.0 s |
| Données | Tableau des stratégies abîmé dans une sauvegarde : ignoré sans erreur | échoué : browser.newContext: Target page, context or browser has been closed | 0.0 s |

## Non couvert ici

Ces tests simulent les plugins natifs (mêmes appels, mêmes réponses). Ils ne remplacent pas un essai sur un vrai iPhone et un vrai téléphone Android (voir docs/TESTS-APPAREILS.md) : chiffrement natif réel, HealthKit, notifications réelles, VoiceOver et TalkBack.
