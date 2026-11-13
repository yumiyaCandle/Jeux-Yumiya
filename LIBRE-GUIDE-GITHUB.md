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

## Brancher la vraie IA de Sam (gratuit, 5 minutes, une seule fois)

Sur GitHub, Sam marche en mode hors ligne. Pour qu'il devienne une vraie IA qui répond à tout :

1. **dash.cloudflare.com** (compte gratuit) → **Workers & Pages** → **Créer** → **Commencer avec « Hello World »** → nom : `libre-ia` → **Déployer**.
2. **Modifier le code** → efface tout → colle **tout** le fichier **`libre-ia-gratuite.js`** (petit fichier, ~11 Ko) → **Déployer**.
3. Onglet **Liaisons** → **Ajouter une liaison** → **Workers AI** → nom de variable : **`AI`** → **Ajouter**.
4. Note l'adresse du Worker, par ex. `https://libre-ia.ton-nom.workers.dev`. En l'ouvrant, tu dois voir `{"ok":true,"ai":true}`.
5. Envoie à ta copine **ce lien spécial** (une seule fois), avec ton adresse à la fin :
   `https://yumiyacandle.github.io/Libre-NJ/?ai=https://libre-ia.ton-nom.workers.dev`
   Elle l'ouvre : l'IA est branchée automatiquement, elle n'a rien à taper.
   (Ou : dans l'app → Réglages → **IA de Sam** → colle l'adresse → Tester et enregistrer.)

C'est gratuit (quota quotidien de Cloudflare). Si le quota est dépassé, Sam repasse en mode hors ligne jusqu'au lendemain.

## Ce qui marche sur GitHub

Tout ce qui se passe sur son téléphone : compteur et plan progressif, choix des boissons, annuler une taffe ou un écart, bouton SOS, les 8 techniques de psy, outils (décoder une envie, pensées pièges, quoi faire à la place, lettre, victoires), journal, humeur, calendrier, anneaux, défis, badges, économies, Sam en mode hors ligne, rappels par le Calendrier.

## Ce qui ne marche pas sur GitHub (il faut un serveur)

Comptes et reconnexion sur un autre téléphone, les notifications envoyées par le serveur, les mots des proches. (La vraie IA de Sam marche si tu fais l'étape « Brancher la vraie IA » ci-dessus.)
Pour avoir ça aussi, il faut la version Cloudflare (`libre-worker.js`, voir `LIBRE-GUIDE-CLOUDFLARE.md`).
