# Libre 2.0 : mise en ligne sur Cloudflare — 100 % gratuit

Tout fonctionne avec le **plan gratuit** de Cloudflare, sans carte bancaire et sans clé API :
comptes et sauvegarde (D1), IA de Sam (Workers AI), rappels quotidiens (Cron). Dans l'app, tout est gratuit : aucun achat, aucun abonnement, aucune publicité.

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

## 3. Activer l'IA de Sam — GRATUITE, sans clé (1 min)

1. Dans ton Worker → onglet **Liaisons** (« Bindings ») → **Ajouter une liaison** → **Workers AI**.
2. **Nom de la variable : `AI`** (exactement, en majuscules) → **Ajouter la liaison**.

C'est tout : Sam devient une vraie IA, gratuite, hébergée par Cloudflare (modèle Llama 3.3 70B).
Le plan gratuit de Cloudflare inclut un quota d'IA chaque jour. S'il est dépassé, Sam répond en mode hors ligne jusqu'au lendemain, puis l'IA revient toute seule.

Facultatif : `AI_MODEL` (Paramètres → Variables, type Texte) pour choisir un autre modèle Workers AI, par ex. `@cf/meta/llama-3.1-8b-instruct-fast` (plus léger, donc plus de messages gratuits par jour, mais moins fin).

Tu n'as **pas** besoin de clé Claude ni de payer quoi que ce soit : l'IA gratuite suffit.

## 4. Activer les rappels quotidiens (1 min)

Les rappels (« Comment ça va ? » le soir, engagement le matin, moment sensible) sont envoyés par le serveur. Il faut juste lui dire de se réveiller régulièrement :

1. Dans ton Worker → **Paramètres** → **Déclencheurs** (« Triggers ») → **Déclencheurs Cron** → **Ajouter**.
2. Choisis « Toutes les X minutes » avec **15**, ou colle l'expression : `*/15 * * * *` → **Ajouter**.

Rien d'autre : les clés de notification se créent toutes seules dans la base D1.

Côté iPhone, ta copine doit **installer Libre sur l'écran d'accueil** (Safari → Partager → « Sur l'écran d'accueil »), l'ouvrir depuis l'icône, puis **Réglages → Rappels quotidiens → Activer les rappels**. Apple n'autorise les notifications de sites web que dans ce cas (iOS 16.4 ou plus récent). Une notification test arrive tout de suite pour confirmer.

## 5. Vérifier

Ouvre `https://TON-SITE.workers.dev/api/status` :

```json
{"ok":true,"ai":true,"engine":"cloudflare","accounts":true}
```

- La page affiche autre chose / une erreur 404 → c'est encore l'ancien Worker ou le code n'a pas été collé.
- `"accounts":false` → la liaison D1 `DB` manque.
- `"ai":false` → la liaison Workers AI nommée `AI` manque.
- `"engine":"cloudflare"` = IA gratuite active, `"engine":"claude"` = Claude actif.

## 6. Pour ta copine

1. Elle ouvre le lien dans **Safari**.
2. Juste après « Commencer », l'app lui demande de **créer son compte** (identifiant + mot de passe) et lui donne un **code de secours** à garder.
3. Ensuite tout est sauvegardé automatiquement. Nouveau téléphone ou Safari vidé : **« J'ai déjà un compte »** → elle retrouve tout.
4. **Les mots des proches** : dans Réglages → « Mon pourquoi et les mots de mes proches » → **Demander un mot à un proche**, elle t'envoie un lien. Tu l'ouvres, tu écris ton mot avec ton prénom, et il apparaît dans son app (écran d'accueil + aide d'urgence), avec une notification « 💌 … t'a écrit un mot ». Tu peux en écrire autant que tu veux avec le même lien.
5. **Partager → Sur l'écran d'accueil** pour l'avoir comme une vraie app, puis **Réglages → Rappels quotidiens** pour recevoir un petit mot chaque jour.

---

## Pourquoi pas le zip ?

Le zip (`Libre-Cloudflare-v2.zip`) n'est utile que sur **Cloudflare Pages**, et même là les **rappels quotidiens ne marchent pas** (Pages n'a pas de déclencheur Cron).
Sur **Workers** (ce que tu utilises), un zip est seulement affiché, sans serveur : pas de comptes, pas d'IA.
👉 **La meilleure option est le fichier unique `libre-worker.js` sur un Worker** : tout marche, gratuitement.

## Modifier le code (facultatif)

Sources du serveur : `libre-src/`. `npm install` puis `npm run all` régénère `libre/_worker.js` (Pages) et `libre-worker.js` (fichier unique).
