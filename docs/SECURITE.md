# Sécurité et protection des données de LIBRE

Version 4, 21 novembre 2026 (mise à jour de la version 3 du même jour). **Ceci est un audit interne fait pendant le développement, pas une certification
ni un audit indépendant.** Un test d'intrusion par un tiers reste recommandé avant une diffusion large.

## 1. Principe

Aucun serveur, aucun compte, aucune publicité, aucun outil de mesure d'audience, aucune police ni image chargée depuis Internet.
Toutes les données restent sur l'appareil. Seules les actions de l'utilisateur font sortir quelque chose : ouvrir un lien
(source, ligne d'aide), partager un fichier de sauvegarde ou un bilan.
Vérifié par test : aucune requête externe à l'ouverture ni pendant la navigation (`Démarrage`, `LIBRE.html autonome`, page de présentation).

## 2. Stockage

| Où | Mécanisme | Protection |
|---|---|---|
| App iPhone | `Application Support/LibreVault/*.bin` | AES-256-GCM (CryptoKit), nonce aléatoire de 12 octets à chaque écriture, clé de 256 bits dans le trousseau (`kSecAttrAccessibleAfterFirstUnlock`, non synchronisée avec le trousseau iCloud), protection de fichiers iOS, écriture atomique. iOS peut inclure la clé, chiffrée, dans les sauvegardes **chiffrées** de l'iPhone (iCloud ou ordinateur), jamais dans une sauvegarde non chiffrée. Choix conservé : il permet de retrouver ses données en changeant d'iPhone ; le passer en `ThisDeviceOnly` ferait perdre les données à chaque restauration sur un autre appareil |
| App Android | `files/vault/*.bin` | AES-256-GCM, clé non exportable dans l'Android Keystore, IV aléatoire fourni par le Keystore, écriture atomique (`AtomicFile`), sauvegarde automatique Android désactivée |
| Navigateur (par défaut) | `localStorage` | **Aucun chiffrement** ; l'app le dit dans Profil › Tes données |
| Navigateur (option) | `localStorage`, enveloppe `_webvault` | AES-256-GCM, clé dérivée du mot de passe (PBKDF2-SHA-256, 600 000 itérations, sel aléatoire de 16 octets), IV aléatoire à chaque écriture ; mot de passe jamais enregistré, clé non exportable gardée en mémoire |

Format natif : 1 octet de version + IV (12) + texte chiffré + étiquette GCM (16). Une étiquette invalide (fichier modifié
ou clé différente) fait échouer la lecture : aucune donnée altérée n'est acceptée.

## 3. Ce qui a été vérifié ou corrigé dans cette version

| Risque | Avant | Maintenant |
|---|---|---|
| Journaux techniques | `loggingBehavior: "debug"` : dans les versions de développement, Capacitor écrivait dans la console système les paramètres des appels natifs, donc **tout l'état en clair envoyé au coffre** | `"none"` (configuration source et fichiers générés iOS et Android vérifiés) |
| Coffre momentanément inaccessible (téléphone pas encore déverrouillé depuis un redémarrage, erreur passagère du trousseau ou du Keystore) | Traité comme un coffre illisible : le fichier était mis de côté et l'app repartait vide | Le natif distingue `UNAVAILABLE` (passager) de `UNREADABLE` (définitif). En cas d'indisponibilité, LIBRE affiche « Réessayer », n'écrit rien (ni en clair ni dans le coffre) et ne met rien de côté. Testé |
| Migration vers le coffre interrompue | Une erreur d'écriture pouvait conduire à mettre de côté un coffre vide et à laisser les anciennes données hors de portée | Écriture relue et comparée ; en cas d'échec, LIBRE réessaie au lieu de continuer |
| Changement de mot de passe (web) | Impossible sans désactiver puis réactiver | Ajouté. Les écritures sont suspendues pendant le changement, pour qu'aucune écriture avec l'ancienne clé n'arrive après la nouvelle version. Testé |
| Deux onglets ouverts (web chiffré) | Non testé | Chaque onglet relit la version chiffrée de l'autre ; aucune entrée perdue, rien en clair. Testé |
| Sauvegarde chiffrée modifiée à la main | Non testé | Refusée (étiquette GCM), données actuelles intactes. Testé |
| Ancienne version de l'app (cache) face à des données plus récentes | Pouvait écrire par-dessus | Marqueur `dataV` : une version plus ancienne passe en lecture seule et le dit. Testé |
| Brouillon du journal | Perdu si la fenêtre se fermait | Gardé **en mémoire seulement** (jamais écrit en clair). Testé |

## 3 bis. Corrections de la version 4

| Risque | Avant | Maintenant |
|---|---|---|
| « Effacer toutes mes données » | Une copie complète restait sur l'appareil, sans moyen de la supprimer (sauf en la restaurant) ; le message disait « définitivement supprimés » | Le message annonce la copie ; « Supprimer cette copie » sur l'accueil et dans Profil ; les copies mises de côté (données illisibles, version chiffrée oubliée) sont effacées avec le reste. Testé |
| Politique de confidentialité, clé iOS | « La clé ne quitte pas l'appareil » : inexact (sauvegardes chiffrées iOS) | Texte exact pour iOS et Android, fr et en ; désinstallation (clé iOS restante, inutilisable seule) et effacement des données du navigateur expliqués |
| Numéros d'aide | Un pays absent de la table affichait les numéros d'un autre pays (déduit de la langue) | Plus jamais : message « numéro d'urgence local », 112 dans l'UE, choix du pays. Mention de revérification par pays. Testé |
| Journal vide | « Personne d'autre ne le lit » (absolu) | « Il reste sur ton appareil : LIBRE ne l'envoie nulle part » |

## 4. Verrouillage

- Code PIN : empreinte PBKDF2-SHA-256 (600 000 itérations, sel de 16 octets), jamais le code lui-même ; délais après 5, 10 et
  15 erreurs (30 s, 5 min, 15 min) **enregistrés avec les données** : un rechargement ne les contourne pas (testé).
- Le code **masque** l'app ; il ne chiffre rien. L'app et la politique de confidentialité le disent.
- Biométrie : code natif écrit, option cachée jusqu'à un essai sur téléphone (`BIOMETRIE.md`).
- Code oublié : la seule issue est d'effacer les données de l'appareil (une copie de sécurité est gardée et peut être restaurée).

## 5. Sauvegardes

Format 5. Chiffré par défaut (AES-256-GCM, PBKDF2-SHA-256 600 000) ; export sans mot de passe seulement après confirmation explicite.
« Copier en texte » avertit que le texte n'est pas chiffré. À l'import : taille limitée à 20 Mo, format et version vérifiés
(une version future est refusée), contenu validé et réparé par `normalize()`, tout texte affiché passe par `esc()` (un test importe
un fichier contenant du HTML et du JavaScript : rien ne s'exécute). Une copie de sécurité est faite avant toute restauration ;
une restauration qui échoue ne touche pas aux données en place.

## 6. Notifications

Textes neutres par défaut (« LIBRE », sans nom d'addiction, sans chiffre). Les textes détaillés ne s'affichent que si l'utilisateur
le choisit. Testé avec le plugin simulé ; à vérifier sur appareil réel (écran verrouillé).

## 7. Santé Apple

Lecture seule (`toShare` vide), types demandés seulement quand l'utilisateur coche une mesure, résumés journaliers gardés dans
le coffre, effacés à la déconnexion. Aucune proposition sur Android ni dans le navigateur (testé). La description iOS liste
exactement les mêmes mesures que la politique de confidentialité, en 6 langues.

## 7 bis. Ajouts de la version finale (22 novembre 2026)

- **Politique de sécurité du contenu (CSP)** : aucune connexion vers un serveur extérieur n’est possible depuis la page (`connect-src 'self'`),
  ni objet, ni formulaire, ni balise `<base>`. Réduit fortement l’impact d’une éventuelle faille XSS : les données ne peuvent pas être
  envoyées ailleurs par `fetch`, `XMLHttpRequest`, `WebSocket` ou image externe. Testé (Chromium) ; **non essayé dans les apps natives**.
- Détail complet, plateforme par plateforme : `SECURITE-FINALE.md`.

## 8. Limites et risques résiduels

- **Navigateur sans chiffrement activé** : toute personne ou tout logiciel ayant accès au profil du navigateur peut lire les données.
- **Navigateur chiffré** : pendant que LIBRE est ouverte, la clé est en mémoire ; un logiciel malveillant sur l'ordinateur, une
  extension de navigateur malveillante ou une faille de type XSS pourrait la lire. Le mot de passe ne peut pas être récupéré.
  La langue choisie reste en clair (elle ne révèle rien d'intime).
- **iPhone** : la clé du coffre suit les sauvegardes iCloud et les sauvegardes chiffrées de l'ordinateur (choix fait pour
  pouvoir changer de téléphone) ; elle ne suit pas une sauvegarde non chiffrée.
- **Téléphone déverrouillé et déjà ouvert** : le chiffrement au repos ne protège pas une personne qui a le téléphone en main,
  app ouverte ; c'est le rôle du code de verrouillage.
- **Ancienne version déjà en cache** (avant cette version) : elle ne connaît pas le marqueur `dataV` ; le service worker la remplace
  à la mise à jour.
- **Code natif** : Android compilé et tests unitaires du format chiffré réussis ; iOS ni compilé ni essayé dans cet environnement.
  Rien n'a été essayé sur un appareil réel.
- Aucun test d'intrusion externe, aucune revue de code par un tiers.
