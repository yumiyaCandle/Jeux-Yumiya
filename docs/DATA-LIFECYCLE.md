# Cycle de vie des données de LIBRE

22 novembre 2026. « Testé » = test automatique Playwright (navigateur ; plugins natifs simulés pour iOS et Android). Rien n'est vérifié sur appareil réel.

## 1. Où sont les données

| | iOS | Android | Web / PWA |
|---|---|---|---|
| Données principales | `Application Support/LibreVault/state.bin`, AES-256-GCM | `files/vault/state.bin`, AES-256-GCM | `localStorage['libre.v1']`, en clair ou chiffré (option) |
| Clé | Trousseau iOS (`AfterFirstUnlock`, non synchronisé) ; incluse par iOS dans les sauvegardes **chiffrées** de l'iPhone | Keystore, non exportable | Aucune (en clair) ou dérivée du mot de passe, en mémoire seulement |
| Copie de sécurité | `avant.bin` | `avant.bin` | `libre.v1.avant` |
| Données mises de côté | `state-illisible-<date>.bin` (coffre illisible) | idem | `libre.v1.illisible.<date>`, `libre.v1.chiffre.<date>` |
| Santé Apple | Résumés journaliers dans le coffre | Sans objet | Sans objet |
| Rappels | Programmés dans le système | Programmés dans le système | Seulement app ouverte |
| Cache | Aucun cache de données ; WebView sans données personnelles hors `localStorage` (non utilisé dans les apps) | idem | Service worker : **uniquement les fichiers de l'app** (HTML, polices, photos), jamais les données |
| IndexedDB | Non utilisé | Non utilisé | Non utilisé |

## 2. Opérations

| Opération | Effet | Testé |
|---|---|---|
| Créer un profil, ajouter, modifier | Écriture atomique (natif) ou `localStorage` ; copie chiffrée si l'option web est active | Oui |
| Changer le code | Nouvelle empreinte PBKDF2 ; les données ne sont pas rechiffrées (le code ne chiffre rien) | Oui |
| Activer / désactiver / changer le mot de passe web | Réécriture complète, relue avant de remplacer ; écritures suspendues pendant le changement | Oui |
| Exporter | Fichier remis à l'utilisateur ; LIBRE n'en garde aucune copie (cache supprimé après 2 min dans les apps) | Oui (contenu) |
| Restaurer | Validation complète avant ; copie de sécurité de l'état actuel ; rien n'est modifié en cas d'échec | Oui |
| Supprimer une habitude | Copie de sécurité, puis suppression de l'habitude, de ses consommations et de ses badges | Oui |
| **Effacer toutes mes données** | Copie de sécurité (annoncée, supprimable) ; suppression des données mises de côté du navigateur ; **annulation des rappels programmés** (nouveau) | Oui |
| Supprimer la copie de sécurité | Fichier ou entrée supprimé | Oui |
| Mot de passe ou code oublié | Remise à zéro, rappels annulés ; la version chiffrée oubliée est mise de côté (mot de passe web) | Oui |
| Mettre à jour l'app | Données relues et réparées par `normalize()` ; marqueur `dataV` ; une version plus ancienne passe en lecture seule | Oui (simulé) |
| Désinstaller | iOS et Android : le système supprime les fichiers de l'app ; sur iOS la **clé reste dans le trousseau** (inutilisable sans les fichiers) | Non (appareil) |
| Changer de téléphone | Export chiffré puis restauration (bouton sur l'écran d'accueil d'une installation neuve, nouveau) ; ou sauvegarde chiffrée de l'iPhone | Oui (export / restauration) |
| Sauvegarde système Android | Désactivée (`allowBackup=false`) | Configuration vérifiée |

## 3. Ce que LIBRE ne peut pas effacer

- Les fichiers de sauvegarde ou les bilans déjà exportés (e-mail, cloud, messageries, dossier Téléchargements).
- Les sauvegardes de l'iPhone (iCloud ou ordinateur) faites avant l'effacement.
- Les fichiers `state-illisible-*` des apps natives : chiffrés avec une clé perdue, donc illisibles, mais pas supprimés automatiquement.
- La clé iOS après désinstallation (inutilisable seule).
- Les données Santé elles-mêmes (dans l'app Santé) : LIBRE ne fait que les lire.

L'app et la politique de confidentialité le disent ; aucun message ne promet une suppression « définitive » de ces éléments.
