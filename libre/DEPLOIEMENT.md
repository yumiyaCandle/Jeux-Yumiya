# LIBRE – mettre en ligne la version installable (PWA)

LIBRE existe en deux formes :

| Fichier | Usage | Installable sur l’écran d’accueil | Hors ligne |
|---|---|---|---|
| `LIBRE.html` | Un seul fichier, à ouvrir directement ou à envoyer | **Non** (les navigateurs l’interdisent pour un fichier ouvert directement) | Oui, tout est inclus |
| Dossier `libre/` (`index.html`, `manifest.webmanifest`, `sw.js`, `icons/`, `fonts/`, `photos/`) | À publier sur un site **HTTPS** | **Oui** | Oui, après la première visite |

L’installation ne fonctionne **qu’une fois le dossier publié en HTTPS**. Tant que ce n’est pas fait, ne présentez pas LIBRE comme installable.

## Publier gratuitement avec GitHub Pages

1. Sur GitHub, ouvrir le dépôt › **Settings** › **Pages**.
2. *Source* : « Deploy from a branch ». Choisir la branche qui contient le dossier `libre/`, dossier `/ (root)`.
3. Enregistrer. Après une à deux minutes, l’adresse s’affiche, par exemple
   `https://<compte>.github.io/<depot>/libre/`.
4. Ouvrir cette adresse sur le téléphone, puis dans LIBRE : **Profil › Installer sur ton téléphone**.

Toute autre hébergement statique HTTPS convient (Netlify, Cloudflare Pages, un serveur web) : il suffit de publier le contenu du dossier `libre/` tel quel.

## Vérifier que l’installation fonctionne

- Chrome sur ordinateur : DevTools › *Application* › *Manifest* (aucune erreur) et *Service workers* (« activated »).
- Couper le réseau puis recharger : LIBRE doit s’afficher, avec la police et les photos.
- iPhone : Safari › Partager › « Sur l’écran d’accueil ». Android : menu ⋮ › « Installer l’application ».
  Ordinateur : icône d’installation dans la barre d’adresse (Chrome, Edge) ou Fichier › « Ajouter au Dock » (Safari sur Mac).

## Publier une mise à jour

1. Remplacer les fichiers du dossier publié.
2. Dans `sw.js`, changer la valeur de `VERSION` (par exemple `libre-2026-12-01`).
3. Au prochain lancement, LIBRE propose « Nouvelle version disponible › Mettre à jour ».
   La mise à jour ne touche pas aux données : elles restent dans le stockage local du navigateur.

Si des photos sont ajoutées ou renommées, mettre aussi à jour la liste `CORE` de `sw.js`.

## Données et confidentialité

- Aucune donnée personnelle ne quitte l’appareil : pas de serveur, pas de compte, pas de mesure d’audience.
- Le site d’hébergement voit seulement les demandes de fichiers (comme pour tout site web), jamais les données saisies dans LIBRE.
- Les photos, la police et les icônes sont servies depuis le même site : aucune requête vers Pexels ou un autre service.
- Changer d’appareil : Profil › Tes données › « Exporter un fichier », puis « Restaurer un fichier » sur le nouvel appareil.
