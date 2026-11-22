# Audit final de LIBRE

22 novembre 2026. Base : commit `4fd9817` (V5), copie de sécurité prise avant toute modification (étiquette Git `avant-mission-finale`
et archive V5 conservée). Environnement : Linux sans Mac ni téléphone ; le web est bloqué hors moteur de recherche.

## 1. Diagnostic initial (avant modification)

| Priorité | Problème | Où | Constat |
|---|---|---|---|
| **P1** | Aucune politique de sécurité du contenu (CSP) | `index.html`, `privacy.html`, site | Une injection de script future aurait pu envoyer les données vers l'extérieur ; la promesse « aucune connexion » n'était imposée par rien |
| **P1** | Aucune ligne d'aide spécialisée pour les jeux d'argent, alors que l'app propose ce suivi | Table `HELP` | Personne qui suit « Jeux d'argent » orientée seulement vers des lignes générales |
| **P1** | Numéros d'urgence du SOS accessibles seulement après défilement | SOS | En situation de crise, un geste de trop |
| **P1** | Feuilles modales grises et peu lisibles (verre clair sur voile sombre) | Toutes les feuilles | Libellés à 3,5:1 |
| **P1** | Texte secondaire sous le seuil AA (4,26:1) en mode clair | Toute l'app | WCAG 1.4.3 |
| **P1** | Liens texte de 20–23 px de haut | Accueil, Habitudes, Profil, SOS | WCAG 2.5.8 (24 px), Apple 44 pt |
| **P2** | Titre de l'écran d'accueil coupé ; à 320 × 568, la zone de boutons recouvrait titre et slogan | Installation neuve | Premier contact dégradé |
| **P2** | Onglets et filtres coupés net, sans indice de défilement | Bibliothèque, Journal, Statistiques | |
| **P2** | Pastille de notification à 3,59:1 en mode sombre | En-tête | |
| **P2** | Placeholder « Rechercher dans mon journa… » tronqué | Journal | |
| **P2** | Montants au format incohérent (« 48.67 CHF » / « 229 CHF ») | Statistiques | |
| **P2** | Permission `INTERNET` déclarée (modèle Capacitor) alors que l'app ne se connecte jamais | Android | Sans risque actif ; retrait à valider sur appareil |
| **P2** | Aucune vérification automatique des contrastes, des cibles, des versions ; CI sans audit des dépendances | Outils | |
| **P3** | Captures des stores antérieures aux changements | `libre-app/store/out` | |

Aucun **P0** nouveau trouvé : pas de perte de données, pas de contenu médical dangereux, pas de déclaration de confidentialité fausse.
Vérifiés sans défaut : restauration (aperçu, confirmation, copie de sécurité), rappels discrets, avertissements de sevrage
(alcool, benzodiazépines, opioïdes), échappement du HTML, 6 langues complètes pour l'interface, performances (3 ans d'historique,
téléphone modeste simulé).

## 2. Corrections réalisées

Toutes testées (voir `TESTS-FINAUX.md`), sauf mention contraire.

1. **CSP** sur les trois pages (`SECURITE-FINALE.md` § 2) ; test : aucune violation, connexion externe bloquée.
2. **Lignes « jeux d'argent »** confirmées par des sources officielles ou les opérateurs : France (Joueurs Info Service), Royaume-Uni
   (National Gambling Helpline), Allemagne (BIÖG), Italie (ISS), États-Unis (NCPG 1-800-522-4700, qui remplace 1-800-GAMBLER depuis
   septembre 2025). Affichées seulement si l'habitude est suivie. Suisse : non ajoutée (numéro non reconfirmé).
3. **SOS** : « Urgences <numéro> » et « Numéros d'aide » en haut de l'écran.
4. **Feuilles modales** opaques ; **texte secondaire** et **pastille** au-dessus de 4,5:1 ; **zones tactiles** des liens agrandies.
5. **Écran d'accueil** : titre visible, zone d'actions allégée.
6. **Fondu des listes horizontales** (référence 21st.dev adaptée sans dépendance).
7. Placeholder court, montants arrondis à l'unité dès 10.
8. **Outils** : `npm run check:contrast`, `check:targets`, `check:versions` ; CI : `npm audit`, accessibilité, versions.
9. **Test de non-régression** de l'avertissement de sevrage.
10. Captures des stores régénérées ; comparaisons avant/après dans `docs/ux/`.

Non modifiés volontairement : chiffrement (aucune raison de toucher un mécanisme correct et testé), identifiants, numéros de version
de l'app (1.0.0 / build 1 : rien n'a été publié), nom « LIBRE » (décision juridique qui t'appartient), biométrie (désactivée).

## 3. Critères d'acceptation

| # | Critère | État | Preuve / ce qui manque |
|---|---|---|---|
| 1 | Fonctionnalités essentielles | **Rempli (web)** | 67 tests ; natif seulement simulé |
| 2 | Données existantes préservées | **Rempli** | Aucun changement de format ; tests de migration |
| 3 | Sauvegardes compatibles | **Rempli** | Format 5 inchangé ; tests d'import |
| 4 | Chiffrement fonctionnel | **Partiel** | Web : testé. Android : testé sur JVM. iOS : jamais compilé |
| 5 | Données sensibles protégées | **Partiel** | Code revu, CSP ajoutée ; aperçus natifs non essayés sur appareil |
| 6 | Politique cohérente avec le code | **Rempli pour le contenu** | Éditeur, contact, adresse publique : à fournir |
| 7 | Contenus sensibles non dangereux | **Revue interne seulement** | Validation professionnelle obligatoire (`VALIDATION-MEDICALE.md`) |
| 8 | Ressources d'aide fiables | **Partiel** | 46 confirmées par source officielle ; 65 à vérifier ; aucun appel réel |
| 9 | 6 langues cohérentes | **Rempli pour l'interface** | Bibliothèque et frise « Mon corps » en anglais pour DE, IT, ES, PT (relecture médicale nécessaire) |
| 10 | Interfaces propres et accessibles | **Rempli (mesuré)** | Contrastes AA, cibles ≥ 24 px, texte 150–200 % ; lecteurs d'écran non essayés |
| 11 | Performances | **Rempli (simulé)** | 3 ans d'historique < 1,5 s par écran ; téléphone modeste simulé |
| 12 | iOS et Android synchronisés | **Rempli** | `check:versions` |
| 13 | Tests disponibles exécutés | **Rempli** | Sauf iOS (pas de Mac) et CI (jamais lancée) |
| 14 | Limites indiquées | **Rempli** | `TESTS-FINAUX.md` |
| 15 | Documentation conforme | **Rempli** | Docs mises à jour dans ce commit |
| 16 | Archive complète | **Rempli** | `LIBRE-FINAL-COMPLET.zip`, extraite et reconstruite dans un dossier vierge |

## 4. Niveau de préparation

| Cible | Niveau | Pourquoi |
|---|---|---|
| Web / PWA | **7,5 / 10** | Testée de bout en bout, CSP, accessibilité mesurée ; manquent validation médicale, éditeur, hébergement public et essai Safari iOS |
| Android | **5,5 / 10** | Compile, tests JVM et lint passent ; jamais lancée sur un téléphone ; non signée |
| iOS | **3 / 10** | Code complet, jamais compilé (pas de Mac) |
| Publication officielle | **2,5 / 10** | Bloquée par : marque « LIBRE », validation médicale, informations légales, essais sur appareils, signature et comptes développeur |

**LIBRE n'est pas prête à publier.** Les points bloquants qui dépendent de toi sont dans `ACTIONS-RESTANTES.md`.
