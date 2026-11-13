# Libre sur GitHub Pages (gratuit, 2 minutes)

La version GitHub est dans le dossier **`docs/`** de ce dépôt. Elle est déjà prête.

## Activer le site

1. Va sur **github.com/yumiyaCandle/Jeux-Yumiya** → **Settings** (Paramètres) → **Pages** (dans le menu à gauche).
2. Dans **Build and deployment** → **Source** : choisis **Deploy from a branch**.
3. **Branch** : choisis `claude/pensive-cannon-nk5uza` (ou `main` si tu as fusionné la branche), puis le dossier **`/docs`** → **Save**.
4. Attends 1 à 2 minutes, puis recharge la page **Settings → Pages** : l'adresse du site s'affiche en haut, normalement
   **https://yumiyacandle.github.io/Jeux-Yumiya/**

> GitHub Pages est gratuit pour un dépôt **public**. Si ton dépôt est privé, passe-le en public (Settings → General → Danger Zone → Change visibility), ou utilise Cloudflare.

## Pour ta copine

1. Elle ouvre le lien dans **Safari**.
2. **Partager → Sur l'écran d'accueil** : Libre s'ouvre comme une vraie app, et Safari garde mieux ses données.
3. Pour des rappels chaque jour : **Réglages → Rappels dans mon Calendrier** (de vraies notifications, sans serveur).
4. Une fois par semaine ou deux : **Réglages → Exporter une copie** (l'app le lui rappelle). Si un jour ses données disparaissent, **Importer une copie** remet tout.

## Activer les comptes, l'IA et les rappels (site sur GitHub + serveur gratuit Cloudflare)

GitHub ne peut pas stocker de comptes : le site reste sur GitHub, mais il utilise ton Worker Cloudflare comme serveur.

1. **Cloudflare** : Workers & Pages → Créer → « Hello World » → **Modifier le code** → colle tout **`libre-worker.js`** → **Déployer**.
2. **Liaisons** : ajoute **D1** (nom `DB`, crée la base `libre-db`) et **Workers AI** (nom `AI`).
3. **Paramètres → Déclencheurs → Cron** : `*/15 * * * *` (rappels quotidiens).
4. Ouvre `https://TON-WORKER.workers.dev/api/status` → tu dois voir `"ai":true` et `"accounts":true`.
5. Sur **GitHub**, ouvre `index.html` → crayon ✏️ (Edit) → tout en haut, remplace
   `var LIBRE_SERVEUR="";` par `var LIBRE_SERVEUR="https://TON-WORKER.workers.dev";` → **Commit changes**.
   (Ou envoie l'adresse à Claude, il te renvoie le fichier prêt.)

C'est tout : sur `https://yumiyacandle.github.io/Libre-NJ/`, créer un compte, se connecter, l'IA de Sam, les rappels et les mots des proches marchent.

## Ce qui marche sur GitHub

Tout ce qui se passe sur son téléphone : compteur et plan progressif, choix des boissons, annuler une taffe ou un écart, bouton SOS, les 8 techniques de psy, outils (décoder une envie, pensées pièges, quoi faire à la place, lettre, victoires), journal, humeur, calendrier, anneaux, défis, badges, économies, Sam en mode hors ligne, rappels par le Calendrier.

## Ce qui ne marche pas sur GitHub (il faut un serveur)

Sans l'étape ci-dessus : comptes, IA de Sam, notifications du serveur et mots des proches ne marchent pas (Sam reste en mode hors ligne).
Pour avoir ça aussi, il faut la version Cloudflare (`libre-worker.js`, voir `LIBRE-GUIDE-CLOUDFLARE.md`).
