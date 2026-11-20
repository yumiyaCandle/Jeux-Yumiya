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
| Navigateur, PWA, LIBRE.html | `localStorage['libre.v1']`, copie de sécurité `libre.v1.avant` | Aucun (dit clairement dans l’app) |
| App iPhone | `Application Support/LibreVault/state.bin` et `avant.bin` | AES-256-GCM, clé 256 bits dans le trousseau (AfterFirstUnlock) + protection de données iOS |
| App Android | `files/vault/state.bin` et `avant.bin` | AES-256-GCM, clé non exportable dans l’Android Keystore |

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

## Langues

Catalogues pour 19 langues + compléments `EXTRA`. Interface complète : fr, en, de, it, es, pt. Les 14 autres sont signalées « Partielle »
(interface en anglais, textes de sécurité traduits). Contenus longs (bibliothèque, frise « Mon corps ») : fr et en ; fiches par addiction :
6 langues. Dates, nombres et devises via `Intl` selon la langue et le pays.

## Tests

- `tests/run.js` : suite Playwright (serveur intégré, plugins natifs simulés avec la même interface), résultats dans `tests/RESULTATS.md`.
- `libre-app/android/app/src/test/` : tests JUnit du format chiffré du coffre.
- `docs/TESTS-APPAREILS.md` : plan de test manuel sur iPhone et Android.
