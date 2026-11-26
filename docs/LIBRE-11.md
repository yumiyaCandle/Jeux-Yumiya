# LIBRE 11 « Allégée »

Date : 26 novembre 2026. Refonte demandée : moins de texte et moins d'éléments par écran, pour ne pas se perdre,
en suivant la méthode « unslop » (détecteur d'IA, Damir Sokolovsky, CC BY 4.0). Le tri des fonctions a été validé
avant toute suppression. Les données déjà enregistrées et les anciennes sauvegardes restent compatibles : rien n'est
effacé des données, seules certaines pages ne sont plus affichées.

## Direction (unslop)

- Produit : aider des adultes à arrêter, réduire ou comprendre une addiction, jour après jour, sans jugement.
- Caractère : calme, franc, chaleureux.
- Univers : la nuit qu'on traverse et le matin qui vient — bleu nuit, sauge, papier crème.
- Moments : l'anneau et le compteur de l'accueil, la courbe de Progrès.
- Signature : la pastille de couleur de chaque addiction.

## Navigation : 4 onglets et le bouton Aide

| Onglet | Contenu |
|---|---|
| Aujourd'hui | 4 éléments : compteur (avec « − / + » et « Détails »), la semaine en 3 chiffres, une seule chose à faire aujourd'hui, « J'ai une envie » et « Retarder l'envie de 10 minutes » |
| Mon plan | Jour J, Mes raisons, Mes déclencheurs, Ce qui m'aide, Mes proches, Comprendre, 3 exercices, « Je suis en danger » |
| Progrès | 3 chiffres, une courbe (3, 6 ou 12 mois), étapes franchies, puis liens : calendrier, économies, bilan du mois (PDF pour soi ou son médecin), statistiques détaillées |
| Journal | inchangé |
| Aide | J'ai une envie · Retarder de 10 minutes · Respirer avec moi · Appeler un proche · Je suis en danger, puis « Relire mes raisons » et « Symptômes physiques inquiétants » |

Mesures sur le profil d'exemple (téléphone 390 px) : l'accueil passe de 417 à 106 mots et de 5 264 à 1 439 px de hauteur.

## Fonctions retirées de l'affichage (données conservées)

Mon coach (ses objectifs du jour alimentent « À faire aujourd'hui »), programme de 30 jours, points d'effort, niveaux,
défis de la semaine et badges d'effort, moments marquants, frise Historique, favoris, relevé d'économies imprimable,
onglets de sections en haut des sous-pages. Les anciennes adresses (#coach, #programme, #recompenses, #evolution,
#apercu) mènent à leur nouvelle place.

## Fonctions ajoutées

- **Jour J** (Mon plan) : choisir sa date d'arrêt et la préparer en 3 étapes (prévenir un proche, mettre de côté ce qui
  rappelle la consommation, préparer le premier jour). Enregistré dans le plan, donc dans les sauvegardes.
- **Retarder l'envie de 10 minutes**, en un toucher depuis l'accueil et l'Aide (outil « Reporter l'envie » existant,
  lancé directement ; l'issue est enregistrée comme les autres envies).

## Retouche visuelle (LIBRE 10, même méthode)

Titres en 600 dans la police du logo, logo seul en graisse forte ; libellés en casse de phrase ; surfaces bleu nuit
unies sans halos ni dégradés ; verre réservé à la barre de navigation ; couleur d'addiction en accents ; boutons à
rayon 12 ; plus d'animation en boucle autour du bouton SOS ; pas de point d'exclamation ni de point final sur les titres.

## Tests

Suite E2E : les tests des fonctions retirées de l'affichage sont remplacés par des tests « LIBRE 11 » (accueil en
4 éléments, navigation et redirections, Mon plan et Jour J, Progrès, Aide). Traductions : 6 langues complètes.
