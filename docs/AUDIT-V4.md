# LIBRE version 4 : audit indépendant avant bêta publique

Réalisé le 21 novembre 2026. Audit interne, pas une certification. `AUDIT-V3.md` reste l'historique de la version précédente.

## 0. Point de départ

L'archive `LIBRE-projet-complet(1).zip` n'était pas jointe au message. C'est l'archive livrée en version 3, dont la copie se trouve dans
`livraison/`. Je l'ai extraite (492 fichiers) et comparée fichier par fichier au dépôt : **0 différence**. Point de départ :
commit `3e26148`, repéré par le tag local `sauvegarde-avant-v4`. Tout changement est visible avec `git diff 3e26148`.

**Erreur corrigée dans mes propres rapports** : les documents de la version 3 étaient datés du « 22 novembre 2026 », alors que tout a été
fait et testé le 21 novembre 2026 (date de la machine et des commits). Les dates sont corrigées.

## 1. Problèmes trouvés, classés

| # | Niveau | Problème | Action |
|---|---|---|---|
| 1 | **P0** | « Effacer toutes mes données » gardait une copie complète sur l'appareil, sans moyen de la supprimer ; le message disait « définitivement supprimés » et la politique « pour tout effacer » | **Corrigé** : message exact, « Supprimer cette copie », copies mises de côté effacées avec le reste. Test |
| 2 | **P0** | Pays de l'appareil absent de la table : LIBRE affichait les numéros d'un autre pays (ex. Luxembourg → Suisse) | **Corrigé** : aucun numéro étranger, numéro d'urgence local, 112 dans l'UE, choix du pays. Test |
| 3 | **P0 (éditeur)** | `PRIVACY_URL` pointe vers `yumiyacandle.github.io/Jeux-Yumiya/…` : inaccessible depuis mon environnement, et la branche par défaut `main` ne contient pas `libre/` | **À toi** : vérifier la propriété du compte, activer GitHub Pages sur la bonne branche ou fusionner. L'adresse n'a pas été changée |
| 4 | **P1** | Politique : « la clé iOS ne quitte pas l'appareil » ; le code (`AfterFirstUnlock`) la laisse aller dans les sauvegardes chiffrées iOS | **Corrigé** (politique fr et en) ; code conservé, sinon perte de données à chaque changement d'iPhone |
| 5 | **P1** | Politique : désinstallation, effacement du navigateur, contacts de confiance incomplets | **Corrigé** |
| 6 | **P1** | Numéros d'aide sans vérification documentée | **44 confirmés** le 21/11/2026 par recherche, 65 à vérifier ; l'app indique quels pays sont revérifiés |
| 7 | **P1** | Affirmation absolue « Personne d'autre ne le lit » (journal) | **Corrigé** |
| 8 | **P1** | Régression v3 : en-tête du calendrier sur deux lignes à 320 px | **Corrigé**, test |
| 9 | **P1** | Rapports v3 datés du lendemain | **Corrigé** |
| 10 | **P2** | Manifeste Android : permissions déclarées après `<application>` (lint) | **Corrigé** |
| 11 | **P2** | Captures des stores et images du site antérieures aux changements | **Régénérées** (fr, en ; iOS 1320×2868, Android 1080×1920) |
| 12 | **P2** | Une formulation de frise trop catégorique (« les symptômes de manque disparaissent ») | **Signalée** au relecteur médical, non modifiée par moi |
| 13 | **P3** | Lint : icône monochrome Android 13, ressources inutilisées des modèles Capacitor, appcompat 1.8.0 disponible | Non fait (sans effet sur l'usage) |
| 14 | **P3** | Placeholder « Rechercher dans mon journal » tronqué à 320 px | Non fait (placeholder seulement) |

Vérifié sans problème : aucune journalisation dans la console ; aucun risque XSS trouvé (toutes les insertions de données utilisateur
passent par `esc()`, les deux exceptions repérées sont des constantes ou des valeurs normalisées) ; écouteurs d'événements sans fuite ;
dépendances : 0 vulnérabilité (`npm audit`), à jour ; biométrie toujours cachée (`BIO_ENABLED=false`) ; mode démo absent des apps natives
(test « Version store ») ; 6 langues de lancement sans texte manquant.

## 2. UX / UI

- **Apple Design** (skill) : appliquée en version 3, revérifiée. Feuilles, haptique, mouvement réduit, transparence réduite, contraste élevé,
  zones de sécurité : conformes. Défaut de la v3 corrigé (calendrier).
- **21st.dev** : recherche d'états vides et de parcours de premier lancement ; tous en React, Tailwind et Framer Motion. LIBRE a déjà
  l'équivalent ; rien importé (pas de dépendance ajoutée).
- **Captures examinées** sur 7 configurations (320, 360, 375 avec texte à 150 %, 390, 393, 412, 430 px ; clair et sombre ; fr, en, de, it, es, pt) :
  accueil, habitudes, progrès, calendrier, journal, outils, bibliothèque, profil, SOS, ajout d'une consommation.

## 3. Ce qui reste (hors de ma portée ou de ton ressort)

Compilation iOS et tous les essais sur appareils réels ; signature Android et iOS ; adresse publique de la politique ; informations légales ;
validation médicale ; 65 numéros d'aide à vérifier ; vérification des 82 liens de sources ; traduction humaine des contenus longs.
Liste complète : `ACTIONS-RESTANTES.md`.

## 4. Pistes évaluées (partie 13)

| Piste | Utilité | Simplicité | Risque médical | Risque confidentialité | Coût | Doublon | Décision |
|---|---|---|---|---|---|---|---|
| Préparation d'une situation à risque (modèles « soirée », « stress ») | Haute | Moyenne | Faible | Nul | Moyen | Partiel (plans « si… alors… ») | Plus tard : enrichir les plans existants avec des modèles, pas un nouvel écran |
| Rappel « moment à risque » 15 min avant l'heure habituelle des envies | Moyenne | Haute | Faible | Faible (texte neutre) | Faible | Non | Après la bêta, avec retours d'utilisateurs |
| Bilan quotidien | — | — | — | — | — | **Existe** (humeur du jour, petit objectif, journal) | Rien à ajouter |
| Ressources locales par canton / région | Haute | Basse | Faible | Nul | Élevé (vérification continue) | Partiel | Seulement avec un partenaire qui maintient les données |
| Personnalisation du parcours SOS | Moyenne | Moyenne | Moyen (ordre des exercices) | Nul | Moyen | Partiel | Après avis médical |

## 5. Niveau de préparation (avis honnête)

- **Bêta publique web** (navigateur, PWA) : **prête techniquement**, sous trois conditions que seul toi peux remplir : une adresse publique
  qui fonctionne pour la politique et le site, tes coordonnées d'éditeur dans la politique, et un avertissement de bêta clair. Je recommande
  aussi une relecture médicale au moins des pages « Quand consulter » avant d'ouvrir à des inconnus.
- **Bêta Android fermée** (test interne Play) : possible dès que l'AAB est signé ; elle servira justement à faire les essais sur appareils.
- **Bêta iOS (TestFlight)** : **pas prête** tant que le projet n'a pas été compilé dans Xcode 26 (code Swift jamais compilé).
- **Publication officielle** : **pas prête**. Bloquants : essais sur appareils réels (iOS et Android), validation médicale documentée,
  informations légales, adresse de la politique, signatures, vérification des numéros d'aide des pays de diffusion.
