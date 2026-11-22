# Sécurité de LIBRE : revue finale, plateforme par plateforme

22 novembre 2026. Revue interne (pas un audit externe, pas un test d'intrusion). « Testé » = test automatique exécuté dans cet
environnement (Linux, Chromium, JVM). Rien n'a été essayé sur un iPhone ou un téléphone Android réel ; le code iOS n'a jamais été compilé.

## 1. Mécanismes, par plateforme

| Élément | iOS (Capacitor) | Android (Capacitor) | Web / PWA / LIBRE.html |
|---|---|---|---|
| Chiffrement des données au repos | AES-256-GCM, CryptoKit (`LibreVaultPlugin.swift`) | AES-256-GCM, `javax.crypto` (`LibreVaultPlugin.java`) | Facultatif : AES-256-GCM, Web Crypto, clé dérivée du mot de passe (PBKDF2-SHA-256, 600 000 itérations) |
| Clé | Trousseau, `AfterFirstUnlock`, non synchronisée par iCloud Keychain ; incluse dans les sauvegardes chiffrées de l'iPhone | Android Keystore, non exportable | En mémoire seulement, jamais stockée |
| IV / nonce | Aléatoire, 12 octets (CryptoKit) | Aléatoire, 12 octets, imposé par le Keystore (`setRandomizedEncryptionRequired`) | Aléatoire, 12 octets |
| Écriture | Atomique (fichier temporaire puis remplacement), copie `avant.bin` | `AtomicFile`, copie `avant.bin` | `localStorage` ; écritures suspendues pendant un changement de mot de passe |
| Fichier illisible | Mis de côté (`state-illisible-<date>`), jamais écrasé | Idem | Idem (`libre.v1.illisible.<date>`) |
| Coffre momentanément inaccessible (avant le premier déverrouillage) | Erreur `UNAVAILABLE` : écran « Réessayer », rien n'est écrit en clair | Idem | Sans objet |
| Code de verrouillage | PBKDF2-SHA-256, 600 000 itérations, sel 16 octets ; délais après 5, 10, 15 erreurs | Idem | Idem |
| Biométrie | Codée, **désactivée** (`BIO_ENABLED=false`) jusqu'aux essais sur appareil | Idem | Sans objet |
| Sauvegardes exportées | Chiffrées par défaut (AES-256-GCM, PBKDF2 600 000) ; sans mot de passe seulement après confirmation | Idem | Idem |
| Sauvegarde système | Fichiers protégés (`completeUntilFirstUserAuthentication`) | `allowBackup=false`, règles d'extraction vides | Sans objet |
| Aperçu dans le sélecteur d'apps | Écran neutre (`SceneDelegate`) — non compilé | `setRecentsScreenshotEnabled(false)` (13+) ; `FLAG_SECURE` en arrière-plan (7–12) | Contenu masqué (`visibilitychange`, `pagehide`) — testé |
| Rappels | Textes neutres par défaut ; annulés à l'effacement | Idem | Idem |
| Journaux | `loggingBehavior: none` ; aucun `console.log` | Idem ; débogage WebView désactivé | Aucun |
| Réseau | Aucun appel ; CSP | Aucun appel ; CSP ; `allowMixedContent:false` | Aucun appel ; **CSP `connect-src 'self'`** (nouveau) |

Aucun algorithme maison : uniquement CryptoKit, Android Keystore / `javax.crypto` et Web Crypto.

## 2. Nouveau dans la version finale : politique de sécurité du contenu (CSP)

**Constat** : aucune CSP n'était déclarée. Une injection de script (aujourd'hui empêchée par l'échappement systématique, mais une
régression future reste possible) aurait pu envoyer les données vers un serveur extérieur.

**Correction** : balise `<meta http-equiv="Content-Security-Policy">` dans `libre/index.html` (donc aussi `LIBRE.html` et les apps),
`privacy.html` et le site :

```
default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:;
font-src 'self' data:; connect-src 'self'; media-src 'self'; frame-src 'self'; worker-src 'self'; manifest-src 'self';
object-src 'none'; base-uri 'none'; form-action 'none'
```

- `connect-src 'self'` : `fetch`, `XMLHttpRequest`, `WebSocket`, `sendBeacon` vers l'extérieur sont bloqués.
- `img-src` sans hôte externe : une image ne peut pas servir à faire sortir des données dans son adresse.
- `script-src 'unsafe-inline'` est conservé : l'app est un fichier unique et Capacitor Android injecte son pont en ligne. `eval` reste interdit.
- `frame-ancestors` n'est pas utilisable en balise `<meta>` (il faudrait un en-tête HTTP de l'hébergeur).

**Tests** : « Politique de sécurité (CSP) » — aucune violation en parcourant tous les écrans et le SOS ; un `fetch` vers
`https://example.org` est bloqué et signalé. `LIBRE.html` ouvert depuis un fichier local : aucune violation, aucune image cassée.
**À vérifier sur appareil** : que la CSP ne bloque rien dans les WebView iOS et Android (scénario ajouté à `TESTS-APPAREILS.md`).

## 3. Scénarios vérifiés

| Scénario | Résultat | Type |
|---|---|---|
| Mot de passe de sauvegarde incorrect | Refusé, données intactes | Testé (Chromium) |
| Fichier de sauvegarde modifié (1 octet) | Refusé par l'authentification GCM | Testé (Chromium) |
| Fichier corrompu, JSON hostile, version future | Refusé avec un message ; rien n'est remplacé | Testé (Chromium) |
| Coffre natif : chaque bit modifié, chaque troncature, IV échangé, mauvaise clé | Refusé | Testé (JVM, 11 tests) |
| Coffre natif : 2 000 écritures | Aucun IV réutilisé | Testé (JVM) |
| Coffre natif illisible / indisponible | Mis de côté / écran « Réessayer » | Simulé (plugin factice) |
| Application interrompue pendant l'écriture | Écriture atomique ; copie `avant.bin` | Revue de code ; non testé sur appareil |
| Téléphone redémarré, pas encore déverrouillé | `UNAVAILABLE`, rien n'est écrit | Simulé |
| Mise à jour de l'app | `normalize()` + `dataV` ; ancienne version en lecture seule | Testé (simulé) |
| Restauration | Aperçu, confirmation, copie de sécurité ; second avertissement si la copie est impossible | Testé |
| Suppression complète | Copie de sécurité annoncée et supprimable ; rappels annulés ; données mises de côté effacées | Testé (simulé pour les rappels) |
| Changement d'appareil | Export chiffré puis « Restaurer une sauvegarde » depuis l'accueil | Testé (deux navigateurs) |
| Exfiltration réseau en cas d'injection | Bloquée par la CSP | Testé (Chromium) |
| Bilan HTML contenant du code | Échappé, rien ne s'exécute | Testé |

## 4. Permissions

| Plateforme | Permission | Pourquoi | Quand |
|---|---|---|---|
| iOS | Notifications | Rappels | À l'activation des rappels |
| iOS | HealthKit (lecture seule) | Santé Apple, facultatif | Quand l'utilisateur connecte Santé |
| iOS | Face ID (`NSFaceIDUsageDescription`) | Biométrie (désactivée) | Jamais tant que `BIO_ENABLED=false` |
| Android | `POST_NOTIFICATIONS` | Rappels | À l'activation des rappels (Android 13+) |
| Android | `RECEIVE_BOOT_COMPLETED`, `WAKE_LOCK` | Reprogrammer les rappels après un redémarrage (plugin de notifications) | Sans demande (permissions normales) |
| Android | `VIBRATE` | Retours haptiques | Sans demande |
| Android | `USE_BIOMETRIC`, `USE_FINGERPRINT` | Bibliothèque biométrique (fonction désactivée) | Jamais pour l'instant |
| Android | `SCHEDULE_EXACT_ALARM` | **Retirée** (`tools:node="remove"`) : pas d'alarmes exactes | — |
| Android | `INTERNET` | Déclarée par le modèle Capacitor ; **LIBRE ne fait aucune connexion** (CSP). Non retirée : il faut d'abord vérifier sur un téléphone que la WebView charge l'app sans elle | Sans demande |

Vérifié dans le manifeste fusionné de la version release (`processReleaseManifest`).

## 5. Risques résiduels

- iOS jamais compilé : le chiffrement natif iOS et l'écran neutre sont vérifiés par lecture de code seulement.
- Version web sans mot de passe : données lisibles par qui a accès au profil du navigateur (l'app le dit).
- Version web chiffrée : clé en mémoire pendant l'utilisation ; une extension malveillante pourrait la lire.
- Le code de verrouillage masque l'app ; il ne chiffre pas (un code à 4 chiffres est devinable par qui copie les données).
- Fichiers exportés et sauvegardes iPhone : hors du contrôle de LIBRE (voir `DATA-LIFECYCLE.md`).
- Aucun audit externe ni test d'intrusion : recommandé avant une diffusion large.

## 6. Transformation du 22 novembre 2026

Aucun mécanisme de sécurité modifié : chiffrement, clés, verrouillage, sauvegardes, CSP, voile de confidentialité, rappels discrets sont
inchangés et leurs tests repassent. Changements liés aux données : collecte réduite (âge, sexe, taille, poids non demandés), nouveaux
champs facultatifs (voir `PRIVACY-REVIEW.md` § 6) stockés dans le même état chiffré. Format de sauvegarde inchangé (5).

## 7. Refonte intégrale (22 novembre 2026)

Aucun mécanisme de sécurité modifié. Nouveaux champs : `strat` dans l'historique des envies, plans créés depuis un modèle (mêmes champs
que les plans existants). Stockés dans le même état (coffre chiffré dans les apps). 80 tests, dont tous les tests de sécurité, repassent.

## 8. Refonte « Clairière » (22 novembre 2026)

Aucun mécanisme de sécurité modifié (chiffrement, clés, verrouillage, sauvegardes, CSP, voile, rappels, journaux, permissions,
identifiants). Nouveaux champs facultatifs du journal : `emo` (émotions choisies dans une liste), `goal` (intention pour demain),
`prompt` (question de réflexion choisie). Ils sont stockés dans le même état (coffre chiffré dans les apps, coffre web facultatif),
inclus dans les sauvegardes chiffrées et effacés par « Tout effacer ». L'écouteur ajouté (`toggle` sur les filtres du journal) ne lit
aucune donnée. Les icônes sont générées localement, sans service externe. 84 tests, dont tous les tests de sécurité, repassent.

## 9. Reconstruction « Envol » (22 novembre 2026)

Aucun mécanisme de sécurité modifié. Aucune nouvelle donnée enregistrée : le « moment à risque » est calculé à l'affichage à partir des
consommations déjà notées, sur l'appareil, et n'est jamais stocké ni transmis. Icônes générées localement. Les photos retirées ne sont
plus mises en cache. 87 tests, dont tous les tests de sécurité, repassent.
