# Libre 2.0 : mise en ligne sur Cloudflare (gratuit)

## Pourquoi « Le serveur Libre n'est pas configuré » ?

Le zip a été mis en ligne comme **Worker avec fichiers statiques** (adresse en `…workers.dev`).
Dans ce mode, Cloudflare affiche la page mais **n'exécute pas le serveur** de Libre : pas de comptes, pas d'IA.

La solution : **un seul fichier, `libre-worker.js`**, qui contient tout (le site, les images, les comptes et Sam).

---

## 1. Créer le Worker avec le fichier unique (5 min, plus simple sur un ordinateur)

1. **dash.cloudflare.com** → **Workers & Pages** → **Créer** → **Commencer avec « Hello World »**.
2. Nomme-le (ex. `libre-lea`) → **Déployer**.
3. Clique sur **Modifier le code** (« Edit code »).
4. Dans l'éditeur, **efface tout** le code, puis **colle tout le contenu** de `libre-worker.js` (ouvre-le, Ctrl/Cmd + A, Ctrl/Cmd + C).
5. Clique sur **Déployer**.

Ton site est en ligne sur `https://libre-lea.TON-COMPTE.workers.dev`.
(Tu peux supprimer l'ancien Worker qui ne marchait pas.)

## 2. Activer les comptes (2 min) — obligatoire

1. Dans ton Worker → onglet **Liaisons** (« Bindings ») → **Ajouter une liaison** → **Base de données D1**.
2. **Nom de la variable : `DB`** (exactement, en majuscules).
3. Base de données : **Créer** une nouvelle → nom `libre-db`.
4. **Ajouter la liaison** (Cloudflare redéploie tout seul).

Les tables se créent automatiquement au premier compte.

## 3. Activer la vraie IA de Sam (2 min)

1. Crée une clé sur **console.anthropic.com** → **API Keys** → **Create Key**. Ajoute un peu de crédit et une **limite de dépense** (Settings → Limits).
2. Dans ton Worker → **Paramètres** → **Variables et secrets** → **Ajouter** :
   type **Secret**, nom **`ANTHROPIC_API_KEY`**, valeur : ta clé `sk-ant-…` → **Déployer**.

Facultatif (type « Texte ») : `MODEL` = `claude-sonnet-5-5` pour diviser le coût par deux environ (par défaut `claude-opus-5-5`, environ 1 à 2 centimes par message).

## 4. Vérifier

Ouvre `https://TON-SITE.workers.dev/api/status` :

```json
{"ok":true,"ai":true,"accounts":true}
```

- La page affiche autre chose / une erreur 404 → c'est encore l'ancien Worker ou le code n'a pas été collé.
- `"accounts":false` → la liaison D1 `DB` manque.
- `"ai":false` → le secret `ANTHROPIC_API_KEY` manque.

## 5. Pour ta copine

1. Elle ouvre le lien dans **Safari**.
2. Juste après « Commencer », l'app lui demande de **créer son compte** (identifiant + mot de passe) et lui donne un **code de secours** à garder.
3. Ensuite tout est sauvegardé automatiquement. Nouveau téléphone ou Safari vidé : **« J'ai déjà un compte »** → elle retrouve tout.
4. Conseillé : **Partager → Sur l'écran d'accueil** pour l'avoir comme une vraie app.

---

## Autre option : Cloudflare Pages

Si tu préfères Pages (adresse en `…pages.dev`) : **Workers & Pages → Créer → onglet Pages → Importer des ressources**, glisse `Libre-Cloudflare-v2.zip`,
puis dans le projet : **Paramètres → Liaisons** → D1 nommée `DB`, et **Variables et secrets** → `ANTHROPIC_API_KEY`, puis redéploie le zip.

## Modifier le code (facultatif)

Sources du serveur : `libre-src/`. `npm install` puis `npm run all` régénère `libre/_worker.js` (Pages) et `libre-worker.js` (fichier unique).
