# Architecture technique de LIBRE

## Vue d’ensemble

```
libre/index.html  ── une seule application (HTML, CSS, JavaScript sans dépendance)
   │                 servie telle quelle sur le web (PWA) et embarquée dans les apps natives
   ├─ Navigateur / PWA : stockage localStorage (non chiffré), service worker sw.js (hors ligne)
   └─ libre-app/ (Capacitor 8)
        ├─ iOS (WKWebView)   : LibreVault (CryptoKit + trousseau), LibreHealth (HealthKit), notifications locales, partage
        └─ Android (WebView) : LibreVault (Keystore), notifications locales, partage, bouton Retour
```

Aucun serveur, aucun compte, aucune bibliothèque tierce dans la page (la police Inter et les photos sont incluses).

## Données

État unique `S` (JSON) : `profile`, `habits` (addictions suivies), `logs` (consommations), `journal`, `sos`, `tools`
(envies, plans, déclencheurs, bilans du jour), `contacts`, `reasons`, `notifs` (cloche), `unlocked` (badges),
`prefs` (langue, pays, devise, rappels `nt`, verrouillage `lock`), `health` (résumés Santé Apple).

- **Version du schéma** : `S.v` (actuellement 2). `normalize()` valide et répare tout état chargé (champs manquants,
  types incorrects, données orphelines, valeurs santé non numériques écartées) ; il ne supprime jamais une donnée valide.
- **Format de sauvegarde** : `_libre.format` (actuellement 5). Les fichiers d’un format ou d’un schéma plus récent sont refusés
  avec un message clair au lieu d’être importés partiellement.
- **Règle** : toute évolution de structure ajoute une étape à `normalize()` qui convertit l’ancien format, avec un test
  dans `tests/suite.js` qui charge un état de l’ancienne version.

## Stockage

| Contexte | Où | Chiffrement |
|---|---|---|
| Navigateur, PWA, LIBRE.html | `localStorage['libre.v1']`, copie de sécurité `libre.v1.avant` | Aucun par défaut (dit dans l’app) ; AES-256-GCM avec mot de passe si l’utilisateur l’active |
| App iPhone | `Application Support/LibreVault/state.bin` et `avant.bin` | AES-256-GCM, clé 256 bits dans le trousseau (AfterFirstUnlock) + protection de données iOS |
| App Android | `files/vault/state.bin` et `avant.bin` | AES-256-GCM, clé non exportable dans l’Android Keystore |

Navigateur, chiffrement facultatif (Profil › Tes données) : `libre.v1` et `libre.v1.avant` contiennent alors une enveloppe
`{_webvault:1, enc:'AES-256-GCM', kdf:'PBKDF2-SHA256', iter:600000, salt, iv, ct}`. Clé dérivée du mot de passe, gardée en mémoire (`WKEY`),
écritures en file (`wvPut`). Au démarrage, `load()` repère l’enveloppe (`WV_PENDING`) : rien n’est affiché ni écrit tant que le mot de passe
n’a pas ouvert les données (`wvGate`). Après 5 minutes en arrière-plan, la page se recharge. Mot de passe oublié : l’enveloppe est mise de côté
(`libre.v1.chiffre.<date>`), jamais effacée.

Dans l’app, `save()` met en file d’attente une écriture vers le coffre (une à la fois, la plus récente gagne).
Au démarrage, `vaultBoot()` lit le coffre avant le premier affichage ; si des données existent encore dans le stockage de la WebView
(version précédente), elles sont copiées dans le coffre, relues, comparées, puis seulement effacées. Rien n’est écrit en clair
avant l’ouverture du coffre. Un coffre illisible est déplacé, jamais écrasé.

## Sécurité

- **Code de verrouillage** : PBKDF2-SHA-256, 600 000 itérations, sel aléatoire de 16 octets. Les anciens codes (SHA-256 itéré) sont vérifiés
  puis convertis. Délai après 5, 10 et 15 erreurs (30 s, 5 min, 15 min), enregistré dans les données (un rechargement ne le contourne pas).
  Ce verrou cache l’app ; il ne chiffre rien (un code à 4 chiffres reste devinable par qui copie les données).
- **Sauvegardes** : AES-256-GCM, clé dérivée du mot de passe par PBKDF2-SHA-256 (600 000 itérations, sel 16 octets), IV 12 octets.
  Mot de passe jamais stocké. Export sans mot de passe possible après confirmation explicite.
- **Affichage** : tout texte venant des données passe par `esc()` avant d’être inséré ; un test importe une sauvegarde hostile.
- **Notifications** : textes neutres par défaut sur l’écran verrouillé.
- **Réseau** : aucune requête automatique ; un test vérifie qu’aucune requête externe n’est émise.

## Rappels

Natif : 14 jours de rappels programmés (60 au plus, limite iOS de 64), reprogrammés à chaque ouverture et retour au premier plan,
heure locale recalculée pour chaque jour (changements d’heure et de fuseau pris en compte à la reprogrammation),
période calme et pause appliquées avant programmation. Android : alarmes inexactes autorisées en veille (pas de permission
« alarmes exactes »), reprogrammation après redémarrage par le plugin. Navigateur : rappels seulement app ouverte, les autres dans la cloche.

## Apparence (verre et lumière)

Inspirée d’une vidéo de présentation fournie par l’éditeur, adaptée aux couleurs de LIBRE. Réglable dans Profil › Apparence (`prefs.fx`, `prefs.accent`).
- `html.fx` : lumière d’ambiance (`#amb`, dégradés radiaux fixes, dérive lente), surfaces en verre dépoli (dégradé translucide + bordure claire).
- `html.fx-blur` : flou d’arrière-plan ajouté seulement si l’appareil a au moins 4 cœurs et 3 Go de mémoire (sinon : verre sans flou, plus économe).
- Ouverture : `#app` apparaît en cercle avec un flou qui se dissipe (`fxReveal`). Changement d’écran : les 8 premiers blocs entrent en cascade (`fxBlocks`).
  Graphiques : les barres se transforment d’une période à l’autre (`fxBarsBefore/After`, mise à l’échelle depuis le bas).
- Couleur d’accent : vert LIBRE (défaut), lagon, indigo, corail ; transition douce grâce à `@property`. Contraste des boutons vérifié par test (≥ 4,5:1, clair et sombre).
- Deuxième passe, plus proche de la vidéo : photo de lumière (`sommeil`, incluse dans l’app) très floutée derrière tout (`#amb::before`),
  verre aux valeurs de la vidéo (blanc 62 % → 24 %, flou 40 px, saturation 1,5 ; plus opaque sans flou), carte principale pleine couleur
  (texte blanc ≥ 4,5:1 mesuré sur les pixels par un test), mot clé en italique serif, anneau blanc avec pastilles en orbite (étapes franchies),
  boutons et onglet actif en pilule.
- Troisième passe (références : tableau de bord santé de type Apple Santé / Oura / Whoop) : date en petites capitales, prénom en italique,
  pastille d’initiale ; carte principale « Sombre » (défaut) avec anneau en dégradé chaud lumineux, ou « Couleur » (Profil › Apparence) ;
  barres colorées sous les mesures ; anneaux de la semaine (jours sans, envies traversées, bilans du jour) ; carte objectif lavande ;
  barre d’onglets flottante en pilule sur téléphone, onglet actif dans un rond sombre.
- Tout est coupé si le système demande moins d’animations (`prefers-reduced-motion`) ; le verre devient opaque si le système demande moins de transparence.

## Finitions (guides Apple Design et dataviz)

- Retour haptique natif (plugin Capacitor Haptics) : léger à l’appui, « succès » quand une action se termine, une pulsation à chaque phase de respiration guidée ;
  vibration courte dans les navigateurs qui la permettent. (`navigator.vibrate` n’existe pas sur iPhone.)
- Mode « contraste élevé » du système : surfaces presque opaques, bordures franches.
- Graphiques : barres arrondies en haut et posées à plat sur l’axe ; anneaux de la semaine avec une palette validée par le script dataviz
  (daltonisme, luminosité, contraste) dans chaque thème ; barres sombres à 4:1 de contraste.
- Graphiques à parcourir (`chPick`, `chEnd`) : on glisse le doigt ou la souris sur le graphique, la valeur et la date du point touché
  s'affichent au-dessus (les autres barres s'estompent, repère vertical), puis le résumé « Plus haut : … » revient quand on s'arrête.
  Clavier : un seul arrêt de tabulation par graphique, flèches (Maj : 7 d'un coup), Début/Fin, Échap ; lecture annoncée aux lecteurs d'écran.
  `touch-action: pan-y` garde le défilement vertical de la page. Retour haptique de sélection dans les apps natives seulement.

## Après un écart

Le jour d’un écart (moins d’un jour depuis le dernier arrêt, au moins un jour sans au total), la carte principale montre le total
des jours sans (`cleanDaysOf`) au lieu d’un grand « 0 », avec un lien vers « Comprendre ce moment ». Choix tiré de l’analyse des avis
des concurrents (`docs/ANALYSE-CONCURRENCE.md`) ; test « Après un écart » dans `tests/suite.js`.

## Langues

Catalogues pour 19 langues + compléments `EXTRA` dans `libre/index.html`. **Proposées au lancement : fr, en, de, it, es, pt**
(`LAUNCH_LANGS` ; les autres restent dans le code, non proposées, voir `LANGUES.md`). Interface entièrement traduite dans ces 6 langues
(contrôle : `python3 tools/i18n.py audit`, code de sortie 1 sinon). Contenus longs (bibliothèque, frise « Mon corps ») : fr et en ;
fiches par addiction : 6 langues. Dates, nombres et devises via `Intl` selon la langue et la région.

## Compteurs : ce que chaque chiffre représente

- **Compteur principal** (« 3 jours, 7 h ») : **durée réelle** depuis la dernière consommation (périodes de 24 h, `now() - curStart(h)`).
  Un jour de changement d'heure dure 23 ou 25 h : le passage au jour suivant peut avoir lieu une heure plus tôt ou plus tard.
- **Jours sans** (statistiques, calendrier, « jours sans au total ») : **jours calendaires** en heure locale (`cleanDaysOf`, minuit à minuit),
  calculés avec `setDate` / `setHours` : justes aux changements d'heure et les années bissextiles (test « Calculs », 4 fuseaux).
- **Record** : la plus longue durée entre deux consommations. **Économies** : estimation à partir de la quantité et du budget saisis.
- Les données sont horodatées en temps universel ; un changement de fuseau déplace les frontières de jours calendaires, pas les durées.

## Numéros d’aide

Table `HELP` par pays (34 pays). Pays affiché : choix de l’utilisateur, sinon région de l’appareil. Une région connue mais absente de la table
donne `HELP_NONE` : aucun numéro d’un autre pays, message « numéro d’urgence local » et choix du pays. `HELP_CHECKED` indique les pays dont
les numéros ont été revérifiés (mois) ; l’app l’affiche. Détail et sources : `RESSOURCES-AIDE.md`.

## Compatibilité des données entre versions

Chaque écriture marque les données avec `dataV` (actuellement 3). Une version plus ancienne qui trouve un `dataV` plus grand
passe en lecture seule (`DATA_TOO_NEW`) et le signale. Les champs inconnus sont conservés par `normalize()`.

## Coffre natif momentanément inaccessible

Le plugin renvoie `UNAVAILABLE` (trousseau ou fichier inaccessibles, par exemple avant le premier déverrouillage après un redémarrage)
ou `UNREADABLE` (déchiffrement impossible). `vaultBoot()` attend sur un écran « Réessayer » dans le premier cas (`vaultGate`), et ne met
le fichier de côté que dans le second.

## Outils du dépôt

| Commande (racine) | Rôle |
|---|---|
| `npm ci` puis `npm run test:setup` | Installe Playwright 1.63.0 et Chromium |
| `npm test` | Contrôle des langues, vérifie que `LIBRE.html` est à jour, puis lance tous les tests (code 1 au premier échec) |
| `npm run test:e2e -- "<filtre>"` | Lance seulement les tests dont le nom contient le filtre |
| `npm run build:standalone` | Régénère `libre/LIBRE.html` |
| `npm run build:all` | Régénère `LIBRE.html` puis copie l'app dans les projets iOS et Android (`npx cap sync`) |
| `npm run check:sources` | Vérifie les liens cités (accès Internet nécessaire) |
| `python3 tools/i18n.py export DOSSIER` | Exporte les textes à traduire |

## Tests

- `npm test` (voir ci-dessus). `tests/run.js` : suite Playwright (serveur intégré, plugins natifs simulés avec la même interface), résultats dans `tests/RESULTATS.md`.
- `libre-app/android/app/src/test/` : tests JUnit du format chiffré du coffre.
- `docs/TESTS-APPAREILS.md` : plan de test manuel sur iPhone et Android.
