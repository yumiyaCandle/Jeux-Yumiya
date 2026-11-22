# LIBRE « Envol » : reconstruction complète de l'interface

22 novembre 2026. Base : `1d91a50` (étiquette `avant-envol`, design « Clairière »).
Comparaisons sur trois colonnes, écran par écran (ce matin · Clairière · Envol) : `docs/ux/envol/*.jpg` ; tous les écrans Envol :
`docs/ux/envol/ecrans/`. **Implémenté dans le vrai projet et testé automatiquement dans Chromium. Aucun essai sur téléphone réel ; l'app
iOS n'a jamais été compilée (pas de Mac).**

## 1. Nouvelle direction artistique : « Envol »

L'idée : **sortir d'un cercle fermé**. Le logo est un cercle ouvert dont s'échappe un trait vers un point de lumière (aube). Il remplace
tous les logos précédents (app, icônes iOS/Android/web, écrans de lancement, bouton Aide).

| Élément | Avant (Clairière) | Envol |
|---|---|---|
| Couleurs | Vert pin, brume, abricot | **Nuit → indigo → aube** (`#1E1A55` → `#4B3FD8` → `#FF9A6B`) ; fond lavande très clair `#F4F3F9` ; action principale indigo ; réussite émeraude ; gain ambre ; urgence rouge réservé |
| Typographie | Titres en serif | **Inter seule**, titres très gras (800) et serrés, chiffres grands |
| Structure de page | Titre sur fond uni | **Bandeau d'en-tête en dégradé** sur chaque page, dont la teinte indique la section (aube : aujourd'hui · sarcelle : suivi · rose : journal · ciel : ressources · nuit : profil) ; le contenu, sur cartes flottantes, **chevauche** le bandeau |
| Cartes | Rayon 24, filet | Rayon 26–30, sans bordure, ombre colorée douce |
| Boutons | Pilule | Rectangles arrondis (16), 52 px de haut, indigo avec ombre portée |
| Navigation | Barre pleine largeur, 5 entrées | **Barre flottante** détachée des bords : Aujourd'hui · Suivi · **Aide** (bouton central au logo) · Journal · Ressources ; profil derrière l'avatar |
| Mouvement | Aucun entre les pages | **Entrée des pages** (fondu + glissement, éléments décalés) ; coupé si l'appareil demande moins d'animations |
| Mode sombre | Forêt de nuit | Nuit indigo (`#0C0B1C`), indigo clair pour l'action |

## 2. Nouvelle organisation des pages

| Avant | Envol | Pourquoi |
|---|---|---|
| Onglets Accueil · Habitudes · [Aide] · Progrès · Outils | **Aujourd'hui · Suivi · [Aide] · Journal · Ressources** | Le journal, utilisé chaque jour, devient un onglet ; habitudes et statistiques se rejoignent |
| « Habitudes » et « Progrès » séparés | **Suivi** : un seul espace à 4 onglets (Mes suivis · Statistiques · Calendrier · Bilans) | Tout ce qui concerne le suivi est au même endroit |
| « Outils » : liste d'exercices repliée | **Ressources** : 4 exercices immédiats en tuiles, aide guidée, recommandation, « Ton espace » en grille (plan, bibliothèque, envies, corps, santé), puis tous les exercices | L'utile tout de suite est en haut ; le reste reste à un toucher |
| Journal sous Outils | Journal en onglet | Écrire devient un geste quotidien |

## 3. Écrans reconstruits (comparaison)

| Écran | Avant | Problème | Maintenant | Ce que l'utilisateur gagne |
|---|---|---|---|---|
| **Bienvenue** (`bienvenue.jpg`) | Photo, fond clair, tuiles | Ressemblait à une page web | Plein écran en dégradé aube, grand logo, « LIBRE », 4 promesses, bouton blanc | Une vraie ouverture d'app, mémorable |
| **Aujourd'hui** (`accueil.jpg`) | Compteur à gauche, anneau à droite | Lecture en Z, chiffres secondaires dispersés | Bandeau (date, salut, message) ; **compteur centré** avec l'anneau de la prochaine étape en tête et 3 chiffres en pastilles ; bloc **« Agir maintenant »** (envie, 4 gestes, journée difficile) | On voit d'abord où on en est, puis quoi faire |
| **Aide** (`aide.jpg`) | « Une envie forte ? » puis une liste | Une seule entrée pensée pour l'envie | **« De quoi as-tu besoin, là, maintenant ? »** : 4 besoins (J'ai une envie · Je suis tendu·e ou angoissé·e · J'ai besoin de parler · Je suis en danger), chacun mène directement au bon outil | Pas besoin de savoir quel exercice choisir ; le danger est à un toucher |
| Aide guidée (`aide-guidee.jpg`) | 7 étapes | — | Même parcours, nouvelle mise en forme | Cohérence |
| **Suivi** (`suivi.jpg`, `statistiques.jpg`) | Deux onglets différents | — | Un espace, 4 onglets, bandeau sarcelle | Moins de navigation |
| **Journal** (`journal.jpg`) | Sous Outils | — | Onglet, bandeau rose, question du jour sur fond lavande | Accès direct |
| **Ressources** (`ressources.jpg`) | Liste repliée | Il fallait ouvrir un volet pour trouver un exercice | Tuiles « Un exercice, tout de suite », grille « Ton espace » | Un exercice en un toucher |
| Bibliothèque, plan, santé, corps, envies | Titre sur fond uni | — | Bandeau ciel, intro dans le bandeau, cartes flottantes | Cohérence |
| Profil (`profil.jpg`) | — | — | Bandeau nuit, cartes flottantes | Identité claire des réglages |
| Après une reprise (`apres-une-reprise.jpg`) | — | — | Nouvelle mise en forme ; « Ce qui reste acquis » conservé en tête | Cohérence |
| Feuilles, fenêtres, SOS | — | — | Feuilles à grands rayons, titres en gras, SOS en dégradé nuit | Cohérence |

## 4. Aides améliorées et interactions plus intelligentes

1. **Aide triée par besoin** (ci-dessus) : quatre entrées concrètes au lieu d'une seule.
2. **Moment à risque** (nouveau, accueil) : si l'heure actuelle correspond au moment où la personne consomme le plus souvent (au moins
   40 % de ses consommations notées sur 45 jours, et au moins 4), LIBRE le signale : « C'est souvent le soir que c'est plus difficile
   pour toi », propose « Respirer 2 minutes » ou « Mon plan », et explique pourquoi (« Pourquoi je vois ça ? » : le pourcentage exact,
   « ce n'est pas une prédiction »). Calculé sur l'appareil. Désactivé avec « Conseils personnalisés ».
3. **Exercices immédiats** en tuiles sur Ressources.
4. Conservés : aide guidée en 7 étapes, plans par situation, parcours après une reprise, journal guidé, lecture expliquée des
   statistiques, bibliothèque par thèmes.

## 5. Ce qui n'a pas changé (volontairement)

Données, chiffrement, sauvegardes, verrouillage, CSP, identifiant `ch.libre.app`, versions, permissions. Aucune fonctionnalité
supprimée : chaque page reste accessible (les anciennes adresses `#habitudes`, `#stats`, `#outils`, `#journal`… fonctionnent). L'ancien
style « verre » reste en option. Les photos de l'écran de bienvenue ne sont plus affichées : retirées (fichiers, crédits, cache).

## 6. Tests

87 tests automatisés réussis sur 87 (Chromium), dont 3 nouveaux (triage de l'aide, moment à risque, ressources). Trois défauts trouvés
par les tests pendant la refonte, corrigés dans l'app : la barre flottante masquait un graphique amené à l'écran (marge de défilement
ajoutée) ; les 4 onglets du Suivi débordaient à 320 px en allemand (libellés sur deux lignes) ; les grilles débordaient avec un texte
à 200 % (colonnes adaptatives). Contrastes AA (clair et sombre), zones tactiles ≥ 24 px (44 px pour les commandes principales).
Android compilé (debug, release, AAB), 12 tests unitaires, 0 erreur de lint. iOS non compilé. Aucun appareil réel.

## 7. Limites

- Pas de test avec des personnes ; pas de VoiceOver/TalkBack réels ; animations non vérifiées sur un vrai téléphone.
- Les libellés du triage et du moment à risque ne sont pas validés par un professionnel (`VALIDATION-MEDICALE.md`).
- La nouvelle identité (nom, logo) doit entrer dans ta recherche de marque.
