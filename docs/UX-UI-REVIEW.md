# Revue UX / UI de LIBRE (version finale)

22 novembre 2026. Méthode : captures réelles de tous les écrans (Chromium, profil réaliste de 60 jours), avant et après chaque modification,
à 320 × 568 (allemand), 375 × 812 (clair), 393 × 852 (sombre) et 375 × 812 avec texte à 150 % ; inspection des captures ; contrôles
automatiques des contrastes et des zones tactiles. Références : guides Apple (skill *apple-design* : *Designing Fluid Interfaces*,
*Principles of Great Design*, matériaux, accessibilité) et catalogue 21st.dev (connecteur MCP). Rien n'a été vu sur un vrai téléphone.

Comparaisons avant / après : `docs/ux/*.jpg`.

## 1. Défauts trouvés sur les captures, et corrections

| Écran | Défaut constaté | Principe (Apple) | Correction | Vérifié |
|---|---|---|---|---|
| Accueil d'une installation neuve | Le titre « LIBRE » était coupé par le dégradé de la photo ; à 320 × 568, la zone de boutons collante (3 boutons + 2 mentions) recouvrait le titre et le slogan | Hiérarchie, clarté | Titre au-dessus du dégradé ; zone collante réduite à l'action principale et deux liens (« Restaurer une sauvegarde », « Explorer… ») ; mentions de confidentialité dans le contenu ; photo moins haute sur les écrans courts | Captures 320 / 375 / 430 (`ux/accueil-installation-neuve.jpg`) |
| SOS | Les numéros d'urgence étaient en bas de l'écran, après défilement | Responsabilité, *wayfinding* | Rangée en haut : « Urgences 144 » (appel direct, numéro du pays choisi) et « Numéros d'aide » ; libellé complet pour VoiceOver/TalkBack | Captures FR 375 et DE 320 (`ux/sos*.jpg`) |
| Feuille « Ajouter une consommation » (et toutes les feuilles) | Verre clair posé sur le voile sombre : fond gris, libellés à 3,5:1 | « Ne jamais empiler un matériau clair translucide sur un autre ; une tâche modale = surface + voile » | Surface à 97 % d'opacité, verre conservé en reflet | Capture + contrôle de contraste (`ux/formulaire-consommation.jpg`) |
| Onglets et filtres défilants (bibliothèque, journal, statistiques) | Coupés net au bord (« Autres ac », « Envie »), sans indice de défilement | Lisibilité, *affordance* | Fondu du seul côté où il reste du contenu, mis à jour au défilement (adapté du composant 21st.dev « Scroll Fade Effect », sans dépendance ni React) | Captures (`ux/journal.jpg`) |
| Journal | « Rechercher dans mon journa… » tronqué | Concision | Placeholder « Rechercher » (6 langues), libellé complet conservé pour les lecteurs d'écran | Capture |
| Texte secondaire (mode clair) | 4,26:1 sur les cartes (sous AA) | Accessibilité | `--muted` #6E7581 → #5F6672 | `npm run check:contrast` |
| Pastille de notifications (mode sombre) | 3,59:1 | Accessibilité | Rouge plus profond en sombre | `npm run check:contrast` |
| Liens texte (« Calendrier », « Supprimer », « Changer de pays »…) | Zones tactiles de 20–23 px | Apple : 44 pt ; WCAG 2.5.8 : 24 px | Zone de toucher invisible de +22 px (pseudo-élément), sans changer la mise en page | `npm run check:targets` |
| Montants | « 48.67 CHF » à côté de « 229 CHF » | Cohérence | Montants arrondis à l'unité dès 10 (ce sont des estimations) | Capture |

## 2. 21st.dev : ce qui a été examiné

| Composant | Décision |
|---|---|
| « Scroll Fade Effect » (code récupéré et analysé) | **Adapté** : l'idée du masque en dégradé est bonne, mais le composant estompe toujours les deux bords (le premier onglet paraît effacé). LIBRE n'estompe que le côté où il reste du contenu, gère l'arabe/hébreu (RTL) et ne dépend de rien. |
| « Animated Tabs », « Scroll Fade List » | Non intégrés : React + Framer Motion, et LIBRE a déjà ses onglets ; seule l'idée du fondu a été retenue. |
| « Health Stat Card », « Activity Card » | Non intégrés : barres 3D et animations au survol, peu utiles au toucher et coûteuses ; les cartes de LIBRE affichent déjà les chiffres avec texte et pas seulement la couleur. |

## 3. Écrans passés en revue sans changement nécessaire

Tableau de bord (compteur, record, économies, prochaine étape), Habitudes, Statistiques (7 j / 30 j / 3 m / 12 m, comparaison), Calendrier,
Bilans, Journal, Outils, Bibliothèque, Profil, verrouillage. Vérifiés en clair, sombre, 320 px et texte à 150 % : pas de débordement,
hiérarchie lisible. Une reprise n'efface pas les progrès (test « Après un écart »).

## 4. Limites et suites

- Pas d'essai sur iPhone ni Android : VoiceOver et TalkBack n'ont été vérifiés que par les attributs (`aria-label`, rôles, ordre du DOM).
- Le champ « Heure » affiche le format de l'appareil (sur les captures, celui de Chromium sans réglage régional : américain).
- Allemand, italien, espagnol, portugais : la bibliothèque et la frise « Mon corps » restent en anglais tant qu'une traduction relue
  par un professionnel n'existe pas (l'app le signale). Un article recommandé peut donc apparaître en anglais sur l'accueil.
- Le contrôle de contraste ignore les textes posés sur une photo ou un dégradé (héros de l'accueil) : vérifiés à l'œil sur les captures.
