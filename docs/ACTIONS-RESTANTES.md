# Ce que tu dois fournir ou faire toi-même

Mis à jour le 22 novembre 2026 (version 3). Je n'invente aucune de ces informations.

## 1. Informations légales

| À fournir | Où le mettre |
|---|---|
| Nom de l'éditeur (personne ou société) | `libre/privacy.html` : `[NOM OU SOCIÉTÉ À COMPLÉTER]` / `[NAME OR COMPANY – TO BE COMPLETED]` ; fiches des stores |
| Adresse postale | `libre/privacy.html` : `[ADRESSE À COMPLÉTER]` / `[ADDRESS – TO BE COMPLETED]` ; Google Play si l'app devient payante |
| E-mail de contact (questions sur la confidentialité) | `libre/privacy.html` : `[ADRESSE E-MAIL À COMPLÉTER]` / `[E-MAIL ADDRESS – TO BE COMPLETED]` |
| E-mail de support | `libre/site/index.html` (pied de page, fr et en) ; fiches des stores |
| Numéro d'entreprise (si société) | Fiches des stores, selon le pays |
| Adresse publique de la politique de confidentialité et de la page de présentation | Activer GitHub Pages (ou un autre hébergement) ; si l'adresse change : `PRIVACY_URL` dans `libre/index.html` |
| Validation juridique (nLPD suisse, RGPD si diffusion dans l'UE) | Faire relire `libre/privacy.html` par un juriste. Je n'ai fourni aucun avis juridique |

## 2. Comptes, identifiants, signatures

- Compte **Apple Developer** (99 USD/an) et compte **Google Play Console** (25 USD, une fois).
- **Identifiant de l'app** : `ch.libre.app` suppose que tu contrôles le domaine `libre.ch`. Sinon, choisis le tien
  (définitif après la première publication). Je ne l'ai pas changé.
- **Signature Android** : créer la clé d'upload, la garder hors du dépôt, activer Play App Signing.
- **Signature iOS** : équipe dans Xcode, capacité HealthKit.

## 3. Appareils et essais (impossibles dans mon environnement)

- Un **Mac avec Xcode 26** : compiler l'app iOS (le code Swift et le projet n'ont jamais été compilés ici).
- Un **iPhone** (idéalement un avec Face ID et un avec Touch ID) et **deux Android** (un récent, un ancien, dont un avec empreinte).
- Suivre `TESTS-APPAREILS.md` ; puis `BIOMETRIE.md` pour décider d'activer la biométrie.

## 4. Validation médicale

Par un professionnel de santé qualifié (addictologue de préférence) : liste dans `VALIDATION-MEDICALE.md`. Numéros d'aide de chaque
pays de distribution : `RESSOURCES-AIDE.md` (66 lignes sans date de vérification). Garder une trace écrite de la relecture.

## 5. Traductions humaines

- Contenus longs (bibliothèque, frise « Mon corps ») en allemand, italien, espagnol, portugais.
- Les 14 langues non proposées : fichiers prêts dans `i18n/a-traduire/` (`LANGUES.md`).

## 6. Vérifications à lancer sur un ordinateur connecté

- `python3 tools/check-sources.py` : les 82 liens cités (bloqués dans mon environnement, donc non vérifiés).
- Relire les exigences des stores au moment de la soumission (`PUBLICATION.md`).

## 7. Décisions qui t'appartiennent

- Activer la biométrie après les essais (`BIOMETRIE.md`).
- Rouvrir des langues après traduction (`LANGUES.md`).
- Garder ou non le support iPad (captures iPad à fournir si gardé).
- Pays de distribution (les numéros d'aide affichés en dépendent).
