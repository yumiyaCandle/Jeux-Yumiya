# Libre 2.0 : mise en ligne sur Cloudflare (gratuit)

Le dossier à mettre en ligne est **`libre/`** (ou le fichier **`Libre-Cloudflare-v2.zip`**, qui contient exactement ce dossier).
Il contient le site **et** son petit serveur (`_worker.js`), qui gère :

- **les comptes** : ta copine crée un identifiant et un mot de passe, et retrouve toutes ses données sur n'importe quel téléphone, même si Safari les efface ;
- **l'IA de Sam** : tu mets la clé une seule fois dans Cloudflare. Elle n'a jamais rien à taper, et la clé n'est jamais visible dans l'app.

Sans configuration, le site marche quand même : les données restent sur le téléphone et Sam répond en mode hors ligne.

---

## 1. Mettre le site en ligne (5 min)

1. Va sur **dash.cloudflare.com** → **Workers & Pages** → **Créer** → onglet **Pages** → **Importer des ressources** (« Upload assets »).
2. Donne un nom au projet (ex. `libre-lea`) → **Créer le projet**.
3. Glisse le **contenu** du dossier `libre/` (ou décompresse le zip et glisse le dossier) → **Déployer**.
4. Ton site est en ligne sur `https://libre-lea.pages.dev`.

> Si tu préfères lier le dépôt GitHub : **Pages** → **Connecter à Git** → choisis le dépôt, laisse la commande de build **vide** et mets **`libre`** comme « Répertoire de sortie ».

## 2. Activer les comptes et la sauvegarde (3 min)

1. Dans Cloudflare : **Stockage et bases de données** → **D1** → **Créer une base de données** → nom : `libre-db` → **Créer**.
2. Retourne dans ton projet Pages → **Paramètres** → **Liaisons** (Bindings) → **Ajouter** → **Base de données D1**.
3. **Nom de la variable : `DB`** (exactement, en majuscules) → base : `libre-db` → **Enregistrer**.

Les tables se créent toutes seules au premier compte. Rien d'autre à faire.

## 3. Activer la vraie IA de Sam (3 min)

1. Crée une clé sur **console.anthropic.com** → **API Keys** → **Create Key**. Ajoute un peu de crédit et, conseillé, une **limite de dépense mensuelle** (Settings → Limits).
2. Dans ton projet Pages → **Paramètres** → **Variables et secrets** → **Ajouter** :
   - Type : **Secret**
   - Nom : **`ANTHROPIC_API_KEY`**
   - Valeur : ta clé `sk-ant-…`
3. **Enregistrer**.

Facultatif, dans les mêmes réglages (type « Texte ») :

| Nom | Rôle | Par défaut |
|---|---|---|
| `MODEL` | Le modèle Claude utilisé par Sam | `claude-opus-5-5` (le plus intelligent) |
| `CHAT_DAILY_LIMIT` | Nombre max de messages à Sam par jour et par personne (anti-abus) | `200` |

Coût indicatif : quelques centimes par jour pour une utilisation normale (environ 1 à 2 centimes par message avec le modèle par défaut).
Pour diviser ce coût par deux environ, mets `MODEL` = `claude-sonnet-5-5`.

## 4. Redéployer (obligatoire après les étapes 2 et 3)

Les liaisons et secrets ne s'appliquent qu'au **déploiement suivant** :
projet Pages → **Déploiements** → **Créer un déploiement** → glisse à nouveau le dossier `libre/`.

## 5. Vérifier

Ouvre `https://TON-SITE.pages.dev/api/status`. Tu dois voir :

```json
{"ok":true,"ai":true,"accounts":true}
```

- `"accounts":false` → la liaison D1 `DB` manque, ou tu n'as pas redéployé.
- `"ai":false` → le secret `ANTHROPIC_API_KEY` manque, ou tu n'as pas redéployé.

Dans l'app, l'onglet **Coach** affiche « Sam · en ligne 24 h/24 » avec un point vert quand l'IA marche.

## 6. Pour ta copine

1. Envoie-lui le lien. Dans **Safari** : bouton **Partager** → **Sur l'écran d'accueil** → **Ajouter**. Libre s'ouvre alors comme une vraie app (l'app le lui propose aussi).
2. À la fin du questionnaire, l'app lui propose de **créer son compte** (identifiant + mot de passe). Elle reçoit un **code de secours** à garder : c'est ce qui permet de récupérer le compte en cas d'oubli du mot de passe.
3. Si elle change de téléphone ou si Safari efface tout : **« J'ai déjà un compte »** sur l'écran d'accueil → elle retrouve tout.

---

## Modifier le serveur (seulement si tu veux toucher au code)

Le serveur se trouve en clair dans `libre-src/worker.src.js`. Pour régénérer `libre/_worker.js` :

```bash
cd libre-src
npm install
npm run build        # écrit ../libre/_worker.js
npm run dev          # test local avec Wrangler sur http://localhost:8788
```

Le site lui-même (`libre/index.html`) n'a pas besoin d'être compilé.
