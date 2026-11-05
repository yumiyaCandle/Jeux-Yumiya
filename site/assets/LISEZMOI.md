# Photos, vidéos et pubs du site

Dépose tes fichiers dans ce dossier avec **exactement** ces noms.
Ils remplacent automatiquement les visuels temporaires (dégradés roses).
S'il manque un fichier, le visuel temporaire reste affiché : rien ne casse.

| Fichier | Où il apparaît | Taille conseillée |
|---|---|---|
| `hero.mp4` (+ `hero.jpg` en secours) | Grande vidéo d'accueil | 1920×1080, < 8 Mo, sans son |
| `film.mp4` | Bouton « Voir le film » | 1920×1080 |
| `menu-feature.jpg` | Menu « Boutique » | 800×600 |
| `pub-campagne.jpg` ou `.mp4` | Grande pub (coffrets) | 2400×1000 |
| `pub-gauche.jpg`, `pub-droite.jpg` | Les 2 pubs carrées | 1200×1200 |
| `histoire-1.jpg` … `histoire-3.jpg`, `histoire-4.mp4` | Section « Notre histoire » | 1200×1500 (portrait) |
| `video-1.mp4` … `video-6.mp4` | Carrousel « Les moments Yumiya » | 1080×1920 (format story) |
| `galerie-1.jpg` … `galerie-7.jpg` | Mosaïque Instagram | 1 et 5 : 800×1200 · 3 : 1600×800 · autres : 800×800 |
| `produit-<nom>.jpg` | Photo de chaque bougie (voir `img:` dans `app.js`) | 1200×1500 (portrait 4:5) |

Les produits (noms, prix, catégories, couleurs) se modifient en haut de `app.js`, dans `PRODUCTS`.
