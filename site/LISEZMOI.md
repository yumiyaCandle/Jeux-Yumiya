# Site Yumiya Candle

Site statique : il suffit de mettre le contenu de ce dossier en ligne (GitHub Pages, Netlify…).
Aucune installation n'est nécessaire.

## Pages
| Fichier | Page |
|---|---|
| `index.html` | Accueil (photos des collections, vitrine des 4 bougies) |
| `boutique.html` | Boutique, quiz et comparateur |
| `produit.html?p=lav` · `aut` · `tulip` · `box` | Fiche de chaque bougie |
| `nouveautes.html` | Bonshommes pain d'épices et oursons |
| `atelier.html` | Le film de fabrication (120 images dans `img/film/`) |
| `creer.html` | Composer sa bougie + demande sur mesure |
| `journal.html` | Articles et questions fréquentes |
| `maison.html` | L'histoire des cinq élèves |
| `commande.html` | Adresse puis paiement TWINT |
| `legal.html` | Mentions légales et conditions de vente |

## Modifier le site
- **Produits, prix, réglages** (email, TWINT, Formspree, EmailJS) : en haut de `app.js`, dans `SITE` et `PRODUCTS`.
- **Couleurs** : en haut de `styles.css`.
- **Photos** : dossier `img/`.

## Mettre en ligne sur GitHub Pages
1. Copier le contenu de ce dossier `site/` à la racine du dépôt du site (par exemple `Yumiya-Candle-Web`).
2. Sur GitHub : Settings → Pages → Source : la branche `main`, dossier `/ (root)`.
3. Après une minute, le site est en ligne à l'adresse indiquée.
