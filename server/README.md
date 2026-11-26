# Serveur de comptes LIBRE

Ce serveur gère les comptes et garde une copie **chiffrée de bout en bout** des données de chaque personne.
Il est écrit en Node.js 22 sans aucune dépendance externe (`node:http`, `node:sqlite`, `node:crypto`).

## Ce qu'il fait

| Fonction | Détail |
|---|---|
| Compte par e-mail | e-mail + mot de passe (10 caractères au moins). L'adresse est confirmée par un code à 6 chiffres avant toute connexion. |
| Compte par téléphone | numéro au format international + code SMS à 6 chiffres. Aucun mot de passe. |
| Mot de passe oublié | code envoyé par e-mail, nouveau mot de passe, **toutes les sessions sont fermées**. |
| Changer d'identifiant | ajouter ou modifier l'e-mail (avec mot de passe pour un compte téléphone) ou le numéro, toujours confirmé par code. |
| Déconnexion | sur cet appareil, ou sur tous les appareils (`/v1/auth/logout-all`). |
| Suppression | `DELETE /v1/me` avec `{"confirm":"DELETE"}` : compte, sessions, codes et données supprimés immédiatement. |
| Données | un seul coffre par compte, versionné (conflit détecté : `409`). Le serveur ne reçoit que du texte chiffré. |

## Sécurité

- **Mots de passe** : scrypt (N = 32768, r = 8, p = 1), sel aléatoire, comparaison en temps constant.
- **Codes** : 6 chiffres aléatoires, stockés hachés (SHA-256), valables 10 minutes, 5 essais au plus. 5 codes par heure et par destinataire.
- **Sessions** : jeton aléatoire de 256 bits, seul son hachage est stocké. Expiration après 30 jours sans utilisation (`SESSION_DAYS`).
- **Pas d'énumération de comptes** : l'inscription et « mot de passe oublié » répondent de la même façon qu'un compte existe ou non. Si l'adresse a déjà un compte, son titulaire reçoit un e-mail d'information et son mot de passe ne change pas.
- **Limitation** : 60 requêtes par minute et par adresse IP sur l'authentification, 10 tentatives de connexion par quart d'heure et par e-mail.
- **HTTP** : JSON obligatoire, corps limité à 4 Mo, `Cache-Control: no-store`, `X-Content-Type-Options`, `Referrer-Policy: no-referrer`, `X-Frame-Options: DENY`, HSTS en production. CORS limité aux origines listées.
- **Journaux** : aucune adresse, aucun numéro, aucun contenu n'est écrit dans les journaux.
- **Chiffrement de bout en bout** (dans l'app) : les données sont chiffrées sur l'appareil en AES-256-GCM (Web Crypto) avec une clé aléatoire. Cette clé n'est envoyée qu'enveloppée : par le mot de passe (comptes e-mail) et par une **clé de récupération** affichée une seule fois à l'inscription (PBKDF2-SHA-256, 600 000 itérations). Le serveur ne peut donc pas lire les données, et **LIBRE ne peut pas les récupérer** si la personne perd à la fois son mot de passe et sa clé de récupération. Après une connexion par SMS ou une réinitialisation du mot de passe sur un nouvel appareil, la clé de récupération est demandée.

## À configurer avant la mise en service (non fourni)

Le serveur **refuse de démarrer en production** tant que ces éléments manquent. Rien n'est simulé en conditions réelles.

| Variable | Rôle |
|---|---|
| `NODE_ENV=production` | active les contrôles ci-dessous et HSTS |
| `TRUST_PROXY=1` | le serveur doit être derrière un proxy HTTPS (Caddy, nginx, hébergeur) qui fournit le certificat TLS |
| `MAIL_PROVIDER=http`, `MAIL_API_KEY`, `MAIL_FROM` | envoi des codes par e-mail via une API compatible Resend (`MAIL_API_URL`, par défaut `https://api.resend.com/emails`). Il faut un compte chez le fournisseur et un domaine d'envoi vérifié. |
| `SMS_PROVIDER=twilio`, `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM` | envoi des codes par SMS. Il faut un compte Twilio et un numéro d'envoi autorisé pour les pays visés. |
| `DB_PATH` | fichier SQLite (par défaut `./libre-accounts.db`), sur un disque sauvegardé |
| `ALLOWED_ORIGINS` | origines autorisées, séparées par des virgules, par ex. `capacitor://localhost,https://localhost` pour les apps natives |
| `STATIC_DIR` | facultatif : dossier `libre/` à servir sur la même origine que l'API (le plus simple : une seule adresse HTTPS) |
| `PORT`, `HOST` | par défaut `8787` et `127.0.0.1` |

Ne mettez jamais ces clés dans le dépôt ni dans l'archive : utilisez les variables d'environnement ou le gestionnaire de secrets de l'hébergeur.

## Démarrer

```sh
# Développement local : e-mails et SMS gardés en mémoire (rien n'est envoyé), app servie sur la même origine
STATIC_DIR=libre node server/src/index.js
# Tests du serveur, puis tests de bout en bout de l'app contre ce serveur
npm run test:server
npm run test:accounts
```

En production, servez l'app et l'API sur **la même origine HTTPS** (`STATIC_DIR`) : l'app détecte le serveur via `/v1/health` et rend le compte obligatoire. Si l'API est sur une autre adresse, ajoutez dans `libre/index.html` la balise `<meta name="libre-api" content="https://api.exemple.ch">` et ajoutez cette adresse à `connect-src` dans la politique de sécurité (CSP) de la page ; `tools/set-api.py` fait les deux.

Sans serveur joignable (fichier `LIBRE.html` ouvert hors ligne, aperçu, hébergement statique), l'app fonctionne en mode local et l'indique : aucun faux compte n'est créé dans le navigateur.

## Points juridiques à traiter par l'éditeur

- Hébergement : choisir un hébergeur (idéalement en Suisse ou dans l'UE), signer un contrat de sous-traitance, et le mentionner dans la politique de confidentialité.
- Les fournisseurs e-mail et SMS reçoivent l'adresse ou le numéro et le code (pas les données de suivi) : ce sont des sous-traitants à déclarer (LPD art. 9, RGPD art. 28), avec transfert hors de Suisse le cas échéant.
- Les données de santé sont des données sensibles (LPD art. 5 let. c) : même chiffrées de bout en bout, une analyse d'impact est recommandée.
