# Tests sur un vrai iPhone et un vrai téléphone Android

Ces vérifications ne peuvent pas être faites dans un navigateur de test : chiffrement natif réel, Santé Apple,
notifications délivrées app fermée, VoiceOver/TalkBack, zones sûres des écrans. Note pour chaque ligne : OK, échec (avec capture), ou non testé.

Appareils conseillés : un iPhone récent avec Dynamic Island (iOS 26), un iPhone plus ancien avec bouton d’accueil ou encoche (iOS 15 à 17),
un Android récent (Android 15 ou 16, Pixel ou Samsung), un Android ancien et modeste (Android 8 à 10).

## Installation

| # | Étape | iPhone | Android |
|---|---|---|---|
| 1 | Installer la version de test (Xcode › Run, TestFlight / `adb install app-debug.apk`, test interne Play) | | |
| 2 | Premier lancement : écran de lancement bleu nuit, puis accueil sans clignotement blanc | | |
| 3 | Le bouton « Explorer avec un profil de démonstration » **n’apparaît pas** | | |
| 4 | Créer un profil complet (prénom, deux addictions), fermer l’app (balayage), la rouvrir : tout est là | | |

## Coffre chiffré

| # | Étape | iPhone | Android |
|---|---|---|---|
| 5 | Profil › Tes données : le texte parle de « fichier chiffré (AES-256) » | | |
| 6 | Mise à jour depuis une ancienne version (si une version de test a déjà été installée) : les données sont toujours là | | |
| 7 | **iPhone** : Xcode › Window › Devices › télécharger le conteneur de l’app ; dans `Library/Application Support/LibreVault/state.bin`, aucun texte lisible (prénom, journal) | | — |
| 8 | **Android** : `adb shell run-as ch.libre.app ls files/vault` montre `state.bin` ; `adb shell run-as ch.libre.app cat files/vault/state.bin` n’affiche aucun texte lisible ; `adb backup` / transfert d’appareil n’emportent rien | — | |
| 9 | Remplir 200 entrées de journal (ou restaurer une grosse sauvegarde), fermer, rouvrir : rapide et complet | | |

## Sauvegarde et restauration

| # | Étape | iPhone | Android |
|---|---|---|---|
| 10 | Exporter avec mot de passe : la feuille de partage s’ouvre ; enregistrer dans Fichiers / Google Drive | | |
| 11 | Ouvrir le fichier sur un ordinateur : illisible (seulement `_libre`, `ct`) | | |
| 12 | Effacer toutes les données, puis restaurer le fichier : mauvais mot de passe refusé, bon mot de passe → aperçu → données revenues | | |
| 13 | « Revenir à cet état » après une restauration | | |
| 14 | Exporter sans mot de passe : une confirmation l’explique | | |
| 15 | Bilan mensuel (Progrès › Bilans) : la feuille de partage propose un fichier `.html` ; il s’ouvre et s’imprime / s’enregistre en PDF | | |
| 16 | Changement de téléphone : restaurer le fichier sur le second appareil | | |

## Verrouillage

| # | Étape | iPhone | Android |
|---|---|---|---|
| 17 | Activer un code ; quitter l’app plus d’une minute ; revenir : écran de verrouillage | | |
| 18 | Le clavier numérique apparaît ; le code saisi n’est pas effacé pendant la frappe | | |
| 19 | 5 codes faux → attente ; fermer et rouvrir l’app → toujours en attente | | |
| 20 | « Besoin d’aide maintenant ? » fonctionne depuis l’écran verrouillé | | |

## Notifications

| # | Étape | iPhone | Android |
|---|---|---|---|
| 21 | Profil › Notifications : « Autoriser » déclenche la demande du système (et seulement à ce moment-là) | | |
| 22 | « Tester une notification » : reçue après 5 s, **app fermée** | | |
| 23 | Rappel quotidien réglé à dans 3 minutes : reçu app fermée (accepter un décalage de quelques minutes sur Android) | | |
| 24 | Écran verrouillé : aucun nom de substance ni chiffre dans le texte | | |
| 25 | Redémarrer le téléphone : le rappel suivant arrive quand même | | |
| 26 | Changement de fuseau horaire (Réglages › Date et heure) puis rouvrir l’app : rappels à l’heure locale | | |
| 27 | Refuser l’autorisation : l’app l’indique, les rappels restent dans la cloche ; la réactiver dans les réglages du téléphone | | |
| 28 | Pause 1 jour, période calme : aucun rappel pendant ces moments | | |

## Santé Apple (iPhone uniquement)

| # | Étape | iPhone |
|---|---|---|
| 29 | Profil › Santé Apple : cocher les données, « Connecter » → feuille d’autorisation d’iOS avec le texte de LIBRE | |
| 30 | Autoriser tout : synchronisation, « Voir mon suivi santé » montre pas, sommeil, etc. | |
| 31 | Comparer quelques jours avec l’app Santé (pas, sommeil) : mêmes ordres de grandeur, pas de nuit comptée deux fois avec une Apple Watch | |
| 32 | Synchroniser deux fois : le nombre de jours ne double pas | |
| 33 | Réglages › Santé › Accès › LIBRE : tout désactiver, resynchroniser : « Connecté, aucune donnée reçue » | |
| 34 | « Déconnecter et effacer » : les données santé disparaissent de LIBRE | |
| 35 | Sur iPad : « Non disponible sur cet appareil » (si l’iPad n’a pas Santé) | |

## Navigation, affichage, accessibilité

| # | Étape | iPhone | Android |
|---|---|---|---|
| 36 | Encoche / Dynamic Island / barre de navigation : rien n’est caché, la barre d’onglets et le bouton SOS restent accessibles au pouce | | |
| 37 | **Android** : bouton Retour ferme d’abord la fenêtre ouverte, puis revient à l’écran précédent, puis réduit l’app | — | |
| 38 | Mode sombre du système | | |
| 39 | Texte très grand (Réglages › Accessibilité) : rien ne se chevauche | | |
| 40 | **VoiceOver** (iPhone) / **TalkBack** (Android) : parcourir l’accueil, noter une envie, lancer le SOS ; chaque bouton est annoncé clairement | | |
| 41 | Réduire les animations : la respiration guidée reste utilisable | | |
| 42 | Mode avion : tout fonctionne, sauf les liens externes | | |
| 43 | Appel d’un numéro d’aide depuis la page d’aide : le composeur s’ouvre | | |
| 44 | Liens vers les sources : s’ouvrent dans le navigateur, pas dans l’app | | |
| 45 | Rotation (iPad, tablette Android) | | |

## Performance et batterie

| # | Étape | iPhone | Android |
|---|---|---|---|
| 46 | Ouverture à froid en moins de 2 s sur l’appareil le plus ancien | | |
| 47 | Avec une sauvegarde de 3 ans (fichier fourni par `tests/` ou créé), Statistiques et Journal s’ouvrent en moins de 2 s | | |
| 48 | Batterie : après une journée, LIBRE n’apparaît pas parmi les gros consommateurs | | |

## Ajouts de la version 3

Chaque ligne : résultat attendu ; noter « réussi », « échoué » (avec capture) ou « non fait ».

**iPhone et Android**
- [ ] Redémarrer le téléphone, puis ouvrir LIBRE **avant** de le déverrouiller (depuis une notification si possible) : LIBRE affiche « Tes données ne sont pas encore accessibles » et « Réessayer » ; après déverrouillage, « Réessayer » rouvre les données. Rien n'est perdu.
- [ ] Mode avion : ouvrir LIBRE, SOS, exercices, journal, statistiques : tout fonctionne sans réseau.
- [ ] Rappels en mode avion et après redémarrage : ils arrivent à l'heure prévue, texte neutre sur l'écran verrouillé.
- [ ] Texte du système au maximum (iOS : Réglages › Accessibilité › Affichage et taille du texte ; Android : Taille de police) : aucun texte coupé sur Accueil, Habitudes, Progrès, Profil.
- [ ] VoiceOver / TalkBack : parcourir Accueil, ouvrir SOS, ajouter une consommation, lire un graphique (glisser à un doigt sur le graphique, ou il annonce le résumé).
- [ ] Changer la langue du téléphone en allemand puis en arabe : LIBRE s'affiche en allemand, puis en anglais (l'arabe n'est pas proposé au lancement).
- [ ] La demande d'autorisation Santé (iPhone) s'affiche dans la langue du téléphone (fr, en, de, it, es, pt).

**Biométrie (option cachée : à faire avant de l'activer, voir `BIOMETRIE.md`)**
- [ ] Face ID, Touch ID, empreinte Android : activer, réussir, annuler, échouer ; le code reste utilisable.
- [ ] Téléphone sans biométrie : message « Indisponible sur ce téléphone ».

**Android uniquement**
- [ ] Bouton Retour sur chaque écran et dans chaque fenêtre : ferme la fenêtre, revient en arrière, puis réduit l'app.
- [ ] Refuser la permission de notifications, puis l'accorder depuis les réglages : LIBRE l'indique correctement.
