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
