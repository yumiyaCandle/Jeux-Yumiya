# LIBRE et la conformité Apple sur le chiffrement (export)

Rédigé le 22 novembre 2026. **Ce n'est pas un avis juridique.** En cas de doute, faire confirmer par Apple
(App Store Connect › Contact) ou par un spécialiste du contrôle des exportations.

## 1. Ce que LIBRE chiffre, et avec quoi (vérifié dans le code)

| Où | Quoi | Implémentation | Fournie par |
|---|---|---|---|
| App iPhone, coffre de données | AES-256-GCM | `CryptoKit` (`AES.GCM.seal/open`) dans `LibreVaultPlugin.swift` | **Apple (iOS)** |
| App iPhone, clé du coffre | Stockage de la clé | Trousseau iOS (`SecItemAdd`, `SecItemCopyMatching`) | **Apple (iOS)** |
| App iPhone, fichiers | Protection des données | `FileProtectionType.completeUntilFirstUserAuthentication` | **Apple (iOS)** |
| Sauvegardes exportées, chiffrement web facultatif, empreinte du code | AES-256-GCM, PBKDF2-SHA-256 | API Web Crypto (`crypto.subtle`) appelée par le JavaScript de LIBRE dans la WebView | **Apple (WebKit, partie d'iOS)** |
| App Android | AES-256-GCM, clé dans le Keystore | `javax.crypto.Cipher`, `AndroidKeyStore` | **Google (Android)** |

LIBRE **n'implémente aucun algorithme** et n'embarque aucune bibliothèque de chiffrement (pas d'OpenSSL, pas de libsodium, pas de code AES
écrit à la main). Elle n'a aucune communication réseau chiffrée propre : elle n'appelle aucun serveur.

## 2. Ce que disent les sources officielles consultées

- Apple, « Complying with encryption export regulations » : la clé `ITSAppUsesNonExemptEncryption` vaut NO si l'app, bibliothèques comprises,
  n'utilise aucun chiffrement ou seulement des formes exemptées ; le chiffrement intégré au système d'exploitation est en général exempté
  des documents à fournir, contrairement au chiffrement propriétaire.
  https://developer.apple.com/documentation/security/complying-with-encryption-export-regulations
- App Store Connect, « Export compliance documentation for encryption » : tableau en trois cas. Une app qui utilise **seulement le chiffrement
  fourni par le système d'Apple** n'a aucun document à fournir ; une app qui implémente elle-même un algorithme standard non fourni par le
  système doit fournir la déclaration française (ANSSI) si elle est distribuée en France ; un algorithme propriétaire demande en plus un CCATS américain.
  https://developer.apple.com/help/app-store-connect/reference/app-information/export-compliance-documentation-for-encryption/
- Aide Xcode, « Add export compliance keys » : https://help.apple.com/xcode/mac/current/en.lproj/dev0dc15d044.html

(Recherche faite par moteur de recherche le 22 novembre 2026 ; les pages elles-mêmes n'ont pas pu être ouvertes directement depuis mon
environnement, dont l'accès réseau est restreint. Relire ces pages au moment de la soumission.)

## 3. Conclusion

Tout le chiffrement de LIBRE sur iPhone est **fourni par iOS** (CryptoKit, trousseau, protection des fichiers, WebKit). Cela correspond
au premier cas du tableau d'Apple : **aucun document à fournir**, ni CCATS, ni déclaration française. La valeur actuelle
`ITSAppUsesNonExemptEncryption = false` (NO) est donc **cohérente** avec cette lecture. Elle n'a pas été modifiée.

Point d'incertitude à faire confirmer : Web Crypto est fourni par WebKit (iOS), mais c'est le JavaScript de LIBRE qui l'appelle pour chiffrer
des fichiers que l'utilisateur emporte hors de l'app. Nous le classons comme « chiffrement fourni par le système », comme CryptoKit.
Si Apple ou un spécialiste le classait autrement (« algorithme standard » utilisé par l'app), il faudrait passer la clé à YES, répondre
« algorithmes standard » et déposer la déclaration française auprès de l'ANSSI (ou exclure la France jusqu'au dépôt).

## 4. Réponses à préparer dans App Store Connect

Selon la lecture ci-dessus, si la question est posée (elle ne l'est plus quand la clé vaut NO) :

- « Votre app utilise-t-elle du chiffrement ? » → **Oui** (elle utilise le chiffrement du système).
- « Quel type d'algorithmes votre app implémente-t-elle ? » → **Aucun des algorithmes mentionnés** (LIBRE n'utilise que le chiffrement d'iOS).
- Documents à fournir → **aucun**.

## 5. Google Play

Google Play ne pose pas de questionnaire équivalent. Le chiffrement Android de LIBRE est celui du système (Keystore, `javax.crypto`).
La responsabilité du respect des règles d'exportation reste celle de l'éditeur.

## 6. Actions restantes

1. Relire les deux pages Apple au moment de la soumission.
2. Si le moindre doute subsiste sur Web Crypto : poser la question à Apple et garder la réponse par écrit.
3. Si la classification change : `ITSAppUsesNonExemptEncryption` → YES, déclaration ANSSI pour la France.
