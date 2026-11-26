# LIBRE 8 — « Verre »

Date : 26 novembre 2026. Nouvelle interface inspirée de trois vidéos de référence (barre latérale en verre, tableau de bord
dépoli, tableau de bord à sections). Toutes les fonctions, données et sauvegardes de LIBRE 7 sont conservées.

| Inspiration | Repris dans LIBRE |
|---|---|
| Barre latérale en verre bleu nuit, repliable, recherche ⌘K, élément actif « encastré » dans le contenu, projets avec pastille et compteur, profil en bas | Sur ordinateur et tablette en paysage (≥ 900 px) : barre en verre bleu nuit, recherche (⌘K / Ctrl+K), sections Navigation et Mes suivis (pastille de couleur + jours sans ou quantité sur 7 jours), Aide, carte profil avec niveau, bouton pour la replier (icônes seules, mémorisé). L'onglet actif rejoint le bord avec des coins inversés. |
| Tableau de bord dépoli : salutation, grande carte avec un mot en italique et un anneau, carte du jour avec la semaine et les prochains rendez-vous, tuiles avec variation et petite courbe | Accueil : carte « Ta semaine est *solide* / *en progrès* / *tient bon* / chaque jour compte » (jamais culpabilisante) avec anneau des jours réussis, jours réussis, envies traversées, économies de la semaine ; carte du jour (date, semaine avec point vert ou orange, objectifs restants) ; tuiles de chiffres avec variation sur 7 jours et petite courbe. |
| Sections à compteurs, graphique à barres arrondies dont la plus haute est mise en avant, version sombre épurée | Graphiques de Mon évolution : barres arrondies, la plus haute en couleur pleine ; mode sombre retravaillé. |

- Fond ambiant en CSS (lueurs sauge, pêche et bleu), cartes en verre dépoli (flou + transparence) ; sans transparence si le système demande de la réduire.
- Aucune image, police ou bibliothèque externe ajoutée ; CSP inchangée.
- Sur téléphone : barre flottante du bas inchangée (4 onglets + Aide).
- Écran large (≥ 1180 px) : humeur et motivation côte à côte.

Tests : suite complète + 2 tests « Interface » (ordinateur et téléphone). Contrastes AA et zones tactiles vérifiés.

## Barre en verre liquide (façon Apple)

| | Téléphone | Ordinateur |
|---|---|---|
| Forme | Capsule flottante (4 onglets) + bouton rond séparé pour l'Aide, comme le bouton de recherche d'iOS 26 | Panneau de verre flottant à gauche (recherche ⌘K, navigation, mes suivis, Aide, profil), repliable |
| Matière | Très translucide : flou 16–22 px et saturation de ce qui passe dessous, liseré lumineux plus vif en haut à gauche et en bas à droite, reflet doux, ombre légère | Idem |
| Onglet actif | Goutte de verre qui glisse vers le nouvel onglet en s'étirant (rebond), sans animation si « réduire les animations » est activé | Goutte verticale |
| Défilement | La barre se réduit aux icônes quand on descend, revient quand on remonte | — |
| Accessibilité | Teinte assez dense pour garder le texte lisible sur n'importe quel contenu ; « Réduire la transparence » rend la matière opaque | Idem |

La vraie réfraction (déformation de l'image sous le verre) n'est pas reproduite : elle n'est possible sur le web que dans
certains navigateurs (filtres SVG sur `backdrop-filter`) et dégraderait la lisibilité et les performances sur iPhone.
L'effet est obtenu par le flou, la saturation, le liseré spéculaire et le reflet, qui fonctionnent partout.
