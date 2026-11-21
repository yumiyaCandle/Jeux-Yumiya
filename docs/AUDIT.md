# LIBRE — Audit avant publication App Store / Google Play

> **Document historique (version 1, 20 novembre 2026).** Il décrit l’état de départ : le projet natif s’appelait alors `libre-ios/` et utilisait Capacitor 7. Ces points ont été corrigés depuis : le projet actuel est `libre-app/` (iOS et Android, **Capacitor 8.6**). L’état à jour est dans `AUDIT-V3.md`.

Audit réalisé le 20 novembre 2026 sur la branche `claude/libre-photography-visual-identity-3h9i40`
(`libre/index.html`, ~2,1 Mo, application monopage ; `libre-ios/` projet Capacitor 7).
Le fichier « LIBRE.html » joint au message n’a pas été reçu : l’audit porte sur la version du dépôt,
identique à celle publiée en artefact.

Méthode : lecture du code, analyse statique (fonctions jamais appelées, boutons sans action),
tests automatisés Playwright existants (16 scénarios) relancés, nouveaux tests de charge (3 ans d’historique),
de sécurité (PIN, import malveillant) et vérification des exigences actuelles des stores.

## Architecture constatée

- Un seul fichier HTML : CSS + JavaScript (IIFE), rendu par `innerHTML`, actions déléguées `data-a` → objet `A`.
- État unique `S` sérialisé en JSON dans `localStorage['libre.v1']` à chaque modification (`save()`),
  relu et validé par `normalize()` au démarrage. Copie de sécurité unique `libre.v1.avant` avant import ou effacement.
- i18n : catalogues pour 19 langues + compléments `EXTRA` ; langues « complètes » : fr, en, de, it, es, pt.
- PWA : `sw.js` (cache des 88 fichiers), manifeste, invite de mise à jour.
- Natif : `libre-ios/` (Capacitor 7, plugin Swift `LibreHealth` non compilé), rappels via `@capacitor/local-notifications`.

## Ce qui fonctionne (vérifié par tests exécutés)

Profil et parcours d’accueil, 30 types d’addiction avec unités adaptées, addiction principale, compteurs,
objectifs arrêt/réduction, économies, statistiques 3 mois, calendrier, bilans, journal, envies et déclencheurs,
SOS 5 minutes et exercices, plan personnel, contacts, badges, bibliothèque sourcée, page « Quand consulter »,
19 langues, mode sombre, sauvegarde/restauration avec aperçu et retour arrière, verrouillage par code,
rappels (navigateur et natif simulé), Santé Apple (plugin simulé), mode hors ligne PWA.
Aucune erreur JavaScript dans les 16 scénarios ; aucun bouton sans action (analyse statique).

## Problèmes détectés

### Critique (bloque la publication ou met en danger les utilisateurs)

| # | Problème | Cause | Correction |
|---|---|---|---|
| C1 | **Export de sauvegarde inopérant dans les apps natives** : le bouton affiche « Fichier créé » mais rien n’est enregistré. | Lien `<a download>` sur un blob : non pris en charge par WKWebView (iOS) ni par la WebView Android. | Enregistrement natif (`@capacitor/filesystem`) + feuille de partage système (`@capacitor/share`). |
| C2 | **Bilan mensuel PDF inopérant en natif** (bouton mort). | `window.print()` ne fait rien dans les WebView Capacitor. | En natif : le bilan est partagé sous forme de fichier HTML imprimable. |
| C3 | **Projet Android absent et Capacitor 7 non publiable** : Google Play exige API 36 depuis le 31/08/2026 ; Capacitor 7 cible API 35. App Store exige Xcode 26 / SDK iOS 26 depuis le 28/04/2026. | Projet préparé avant ces échéances. | Passage à Capacitor 8 (cible API 36, Xcode 26), génération de vrais projets `ios/` et `android/`. |
| C4 | **Service worker actif dans l’app Android** : après une mise à jour sur le Play Store, l’ancien code en cache peut continuer à s’afficher ; la rubrique « Installer LIBRE » apparaît dans l’app. | Capacitor Android sert l’app sur `https://localhost`, que `PWA_OK()` accepte. | Service worker et section d’installation désactivés en natif. |
| C5 | **Risque de perte de données par saturation** : `localStorage` est limité à ~5 Mo (WebView). 3 ans d’usage intensif = 2,1 Mo, et la copie de sécurité double l’espace. | Stockage unique dans `localStorage`, copie complète. | Natif : stockage dans un fichier chiffré (pas de limite). Web : avertissement si la copie de sécurité ne peut pas être écrite. |
| C6 | **Affirmation fausse possible** : « Une copie de sécurité est conservée » est affiché même si son écriture a échoué. | `snapshot()` ignore silencieusement l’erreur. | `snapshot()` renvoie un succès ; message adapté et confirmation explicite sinon. |

### Élevée (sécurité, fiabilité, expérience)

| # | Problème | Correction |
|---|---|---|
| E1 | Données sensibles **en clair** sur l’appareil (journal, consommations, santé). | Natif : fichier chiffré AES-256-GCM, clé dans le trousseau iOS / Keystore Android (validé par toi). Web : limite expliquée honnêtement, pas de faux chiffrement. |
| E2 | **Exports en clair** (journal intime inclus). | Chiffrement par mot de passe proposé par défaut (AES-256-GCM, PBKDF2-SHA-256, 600 000 itérations), option « sans mot de passe » signalée. |
| E3 | **Code PIN** : hachage SHA-256 itéré 1 000 fois, sel `Math.random`, repli FNV très faible ; **limite d’essais contournable en rechargeant la page**. | PBKDF2 210 000 itérations, sel `crypto.getRandomValues`, pas de repli faible, ancien hachage migré au premier déverrouillage, compteur d’échecs et délai persistés. |
| E4 | Import d’une sauvegarde produite par une **version plus récente** : champs inconnus perdus sans avertissement. | Format versionné (`_libre.format`), refus explicite d’un format futur, migrations testées. |
| E5 | Mode démo dans les versions store (« fausses données »). | Retiré des builds natifs (validé par toi), conservé dans l’aperçu web. |
| E6 | **Journal** : toutes les entrées rendues d’un coup (0,5 s pour 980 entrées sur ordinateur, ~2 s attendues sur téléphone moyen). | Affichage par pages de 30 ; recherche sur toutes les entrées. |
| E7 | Statistiques : 0,5 s avec 15 800 consommations. | Acceptable mais à surveiller ; mesuré dans les tests de charge. |
| E8 | Pas de politique de confidentialité publiable (obligatoire Apple et Google, et pour HealthKit). | `privacy.html` (fr/en), lien dans l’app et adresse publique après déploiement. |
| E9 | Sauvegarde automatique Android (`allowBackup`) : copierait un fichier chiffré sans sa clé (inutilisable) ; les sauvegardes iCloud non chiffrées n’emportent pas le trousseau. | `allowBackup="false"` + règles d’exclusion ; changement de téléphone via fichier d’export, expliqué dans l’app. |

### Moyenne

| # | Problème | Correction |
|---|---|---|
| M1 | 5 fonctions jamais appelées (`bodyMini`, `deviceRegion`, `recapCard`, `skyBg`, `xpInfo`). | Supprimées. |
| M2 | Les anciens articles de la bibliothèque et la frise « Mon corps » restent en anglais pour de/it/es/pt (contenu long). | Signalé dans l’app (« contenu disponible en anglais ») ; traduction humaine recommandée avant publication dans ces pays. |
| M3 | 14 langues sont partielles (interface en anglais, textes de sécurité traduits). Déjà marquées « Partielle ». | Recommandation : ne déclarer sur les stores que fr, en, de, it, es, pt. |
| M4 | Rappels Android : l’heure exacte n’est pas garantie (Doze, économie de batterie). | Texte honnête dans l’app ; alarmes inexactes autorisées en veille, pas de permission « alarmes exactes » (inutile et soumise à justification sur Play). |
| M5 | Rapports d’incident absents : impossible de savoir qu’une app plante chez un utilisateur. | Volontairement **non ajouté** (aucun SDK tiers, aucune donnée envoyée). |

### Bugs trouvés pendant les tests (phase 4) et corrigés

| # | Problème | Cause | Correction | Test qui l’empêche de revenir |
|---|---|---|---|---|
| B1 | **À la toute première visite, la page se rechargeait ~1 s après l’ouverture** : ce que la personne tapait (prénom pendant l’inscription, code PIN) était effacé. | Le service worker prend le contrôle (`clients.claim`) et l’app rechargeait à chaque `controllerchange`, y compris sans version précédente. | Rechargement seulement si une ancienne version contrôlait déjà la page. | « Inscription : créer un profil de bout en bout » et « Code PIN ancien format » (ils échouaient avant la correction) ; la mise à jour PWA reste testée. |
| B2 | **Écran de verrouillage reconstruit pendant la saisie** (badges et rappels calculés au démarrage) : le code tapé disparaissait. | `render()` reconstruisait l’écran de verrouillage à chaque appel. | L’écran n’est reconstruit que si l’état d’attente change. | « Code PIN : … jamais en clair » et « 5 erreurs bloquent l’accès ». |
| B3 | Le plugin Swift Santé Apple n’avait jamais été versionné dans le dépôt. | L’ancien `.gitignore` excluait `ios/`, ce qui couvrait aussi `native/ios/`. | Fichiers intégrés au projet Xcode `libre-app/ios`, `.gitignore` corrigé. | Vérification du projet Xcode (5 sources Swift référencées). |

### Faible

- Le titre de l’onglet affiche « LIBRE » seul (adapté).
- `uid()` repose sur `Math.random` : suffisant pour des identifiants internes, pas pour de la sécurité (n’est plus utilisé pour le sel du PIN).

## Contenu médical

Les textes sensibles ont été relus et sourcés lors des versions précédentes (OMS, NICE, HAS, NIDA, Cochrane, articles de revues),
date de vérification affichée (20/11/2026). Points vérifiés : jamais d’incitation à l’arrêt brutal pour l’alcool en cas de forte
dépendance ni pour les benzodiazépines ; opioïdes : risque de surdose après une pause, naloxone, traitements de substitution ;
pas de durée de sevrage présentée comme garantie. **Une relecture par un professionnel de santé qualifié reste indispensable
avant publication** : je ne peux pas la remplacer.

## Plan d’action

**Indispensable (fait dans cette version)** : C1 à C6, E1 à E6, E8, E9, M1, B1 à B3.
**Recommandé (fait)** : M4 (textes), tests automatisés dans le dépôt, checklists stores.
**Recommandé (à faire par toi ou un tiers)** : relecture médicale, traduction humaine des contenus longs, captures d’écran,
compte développeur, compilation iOS sur Mac.
**Facultatif (proposé, non développé)** : voir `docs/AMELIORATIONS.md`.

## Résultat après corrections

- 29 tests automatisés de l’app : 29 réussis (`tests/RESULTATS.md`).
- Projet Android compilé ici (APK de débogage, cible API 36) ; 6 tests unitaires du chiffrement : réussis.
- Projet iOS : généré et vérifié par analyse du fichier projet ; **non compilé** (Xcode indisponible ici).
- Non testé faute d’appareil : exécution réelle sur iPhone et Android, HealthKit réel, notifications réelles, VoiceOver, TalkBack
  (plan de test : `docs/TESTS-APPAREILS.md`).
