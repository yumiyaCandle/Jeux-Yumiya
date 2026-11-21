# Publier LIBRE sur l’App Store et Google Play

Exigences vérifiées le 20 novembre 2026 sur les pages officielles d’Apple et de Google (voir « Sources » en bas).
Elles changent régulièrement : relis-les au moment de la soumission.

## 1. Ce que tu dois fournir toi-même

| Élément | Pourquoi | Où l’indiquer |
|---|---|---|
| **Compte Apple Developer** (99 USD/an) au nom de la personne ou de l’entreprise éditrice | Obligatoire pour TestFlight et l’App Store ; HealthKit ne fonctionne qu’avec une app signée | developer.apple.com |
| **Compte Google Play Console** (25 USD, une fois) | Obligatoire ; un compte personnel récent doit d’abord faire un test fermé (règle connue : 12 testeurs pendant 14 jours ; non revérifiée ici, à confirmer dans la Play Console) | play.google.com/console |
| **Identifiant de l’app** | `ch.libre.app` suppose que tu contrôles libre.ch ; sinon choisis un identifiant à toi (ex. `ch.tonnom.libre`), identique sur iOS et Android, **définitif** après la première publication | `capacitor.config.json`, `android/app/build.gradle`, Xcode |
| **Nom, adresse et e-mail de l’éditeur** | Politique de confidentialité, fiches des stores, contact de support | `libre/privacy.html` (champs « À COMPLÉTER »), stores |
| **Adresse publique de la politique de confidentialité** | Exigée par Apple, Google et HealthKit | Activer GitHub Pages (Settings › Pages › branche, dossier racine) : `https://yumiyacandle.github.io/Jeux-Yumiya/libre/privacy.html`, ou un autre hébergement ; mettre à jour `PRIVACY_URL` dans `libre/index.html` si l’adresse change |
| **Adresse de support** (site ou e-mail) | Obligatoire dans les deux stores. Page de présentation prête : `libre/site/` (fr/en), publiée avec GitHub Pages à `…/libre/site/` ; compléter l’e-mail de support dans son pied de page | Stores |
| **Relecture médicale** par un professionnel de santé qualifié (addictologue de préférence) | Contenus sur le sevrage, les opioïdes, les médicaments ; je ne peux pas la remplacer | Garder une trace écrite (nom, date, version relue) |
| **Captures d’écran** | **Prêtes** : `libre-app/store/out/{fr,en}/ios` (1320×2868, iPhone 6,9") et `…/android` (1080×1920), 6 par langue, régénérables avec `node libre-app/store/make-screenshots.js`. À fournir toi-même : iPad 13" si l’iPad est gardé | Profil d’exemple, étiquette « Démo » masquée ; à relire avant envoi |
| **Clé de signature Android** (clé d’upload) et ses mots de passe | Signer le fichier .aab | À garder hors du dépôt |
| **Décision iPad** | L’app fonctionne sur iPad (mise en page large testée) ; si tu ne veux pas fournir de captures iPad, passer `TARGETED_DEVICE_FAMILY` à `1` | Xcode |
| **Pays de distribution** | Les numéros d’aide intégrés couvrent certains pays ; vérifier ceux de chaque pays choisi | Stores |
| **Traductions humaines** des contenus longs (bibliothèque, frise « Mon corps ») pour de, it, es, pt | Aujourd’hui ces contenus s’affichent en anglais dans ces langues | — |

## 2. Checklist App Store (Apple)

**Technique**
- [ ] Construire avec **Xcode 26 / SDK iOS 26** ou plus récent (obligatoire depuis le 28/04/2026).
- [ ] Cible minimale iOS 15 (imposée par Capacitor 8).
- [ ] Équipe de signature choisie, identifiant unique, capacité **HealthKit** active (`App.entitlements` déjà référencé).
- [ ] `Info.plist` : `NSHealthShareUsageDescription` et `NSHealthUpdateUsageDescription` présents (déjà fait) ; textes relus.
- [ ] `PrivacyInfo.xcprivacy` présent (déjà fait) ; Xcode › Product › Archive › « Generate Privacy Report » sans avertissement.
- [ ] `ITSAppUsesNonExemptEncryption = NO` (chiffrement standard du système uniquement) ; confirmer la réponse dans App Store Connect. Pour la France, Apple peut demander une déclaration ; elle n’est en général pas requise pour ce type d’usage, à vérifier au moment de la soumission.
- [ ] Icône 1024 px sans transparence (générée) ; écran de lancement (généré).
- [ ] Version 1.0.0, build 1 ; augmenter le build à chaque envoi.
- [ ] Essais complets sur un iPhone réel (voir `TESTS-APPAREILS.md`), y compris Santé Apple et les rappels app fermée.
- [ ] TestFlight interne, puis externe si possible.

**App Store Connect**
- [ ] Catégorie principale : **Santé et forme** (secondaire possible : Style de vie).
- [ ] Classification d’âge : répondre honnêtement au questionnaire (références aux drogues, à l’alcool et au tabac à visée informative/médicale ; jeux d’argent mentionnés sans jeu réel). Résultat attendu : 17+ ou équivalent selon le nouveau barème ; ne pas sous-déclarer.
- [ ] **Confidentialité de l’app (« étiquettes »)** : « Données non collectées ». C’est exact : rien ne quitte l’appareil vers l’éditeur ou un tiers (Apple ne considère pas comme « collectées » les données traitées seulement sur l’appareil).
- [ ] URL de la politique de confidentialité et URL de support.
- [ ] Notes pour la revue : expliquer qu’il n’y a ni compte ni serveur ; Santé Apple est facultatif (Profil › Santé Apple) ; les rappels sont locaux ; contenus médicaux sourcés et datés ; LIBRE ne pose pas de diagnostic.
- [ ] Directives à relire : 1.4.1 (exactitude des contenus médicaux, sources), 5.1.1 et 5.1.3 (données de santé : pas de publicité, pas de revente, politique de confidentialité), 2.1 (app complète, pas de fonctions factices), 4.2 (fonctionnalité suffisante pour une app WebView : LIBRE apporte stockage chiffré natif, HealthKit, notifications et partage natifs).
- [ ] Description, sous-titre, mots-clés : proposés au point 4.

## 3. Checklist Google Play

**Technique**
- [ ] Cible **API 36 (Android 16)** : obligatoire pour les nouvelles apps et mises à jour depuis le 31/08/2026 (déjà configuré). Minimum API 24.
- [ ] Fichier **.aab** signé avec la clé d’upload ; Play App Signing activé.
- [ ] Permissions : INTERNET, POST_NOTIFICATIONS, RECEIVE_BOOT_COMPLETED, WAKE_LOCK, VIBRATE (retour haptique, permission ordinaire sans demande). `SCHEDULE_EXACT_ALARM` **retirée**. Aucune permission sensible (localisation, contacts, stockage, caméra).
- [ ] `allowBackup="false"` (données chiffrées par une clé non exportable).
- [ ] Essais sur au moins un téléphone réel récent (Android 14 à 16) et un ancien (Android 8 à 10), voir `TESTS-APPAREILS.md`.

**Play Console › Contenu de l’app**
- [ ] **Politique de confidentialité** : URL publique.
- [ ] **Sécurité des données** : « Aucune donnée collectée », « Aucune donnée partagée ». Pratiques de sécurité : les données ne sont pas transmises (le chiffrement en transit est sans objet) ; l’utilisateur peut supprimer ses données dans l’app.
- [ ] **Déclaration « Applications de santé »** (obligatoire pour toutes les apps) : cocher les fonctions de santé concernées (suivi d’addictions / bien-être, informations de santé). LIBRE n’utilise pas Health Connect.
- [ ] **Public cible** : adultes (18+) ; pas de contenu destiné aux enfants.
- [ ] **Classification du contenu** (questionnaire IARC) : répondre honnêtement (références aux drogues, à l’alcool, au tabac et aux jeux d’argent dans un but de prévention).
- [ ] Annonces : « Non, l’app ne contient pas d’annonces ».
- [ ] Accès à l’app : aucun identifiant nécessaire.
- [ ] Catégorie : **Santé et remise en forme** (ou Médecine si tu préfères, mais Santé correspond mieux à une app d’accompagnement).
- [ ] Coordonnées du développeur : adresse e-mail, et adresse postale si l’app est monétisée.
- [ ] Test fermé avant la production si le compte est personnel et récent (conditions exactes affichées dans la Play Console).

## 4. Textes proposés pour les fiches

**Nom** : LIBRE
**Sous-titre (App Store, 30 car.)** : Réduire ou arrêter, à ton rythme
**Description courte (Play, 80 car.)** : Suivi bienveillant pour réduire ou arrêter une addiction. Données privées.

**Description (fr)**
> LIBRE t’accompagne pour comprendre, réduire ou arrêter une addiction : tabac, alcool, cannabis, autres substances, jeux d’argent, écrans, achats…
> • Compteur de jours, économies et objectifs (arrêt ou réduction)
> • SOS : un accompagnement guidé de 5 minutes quand l’envie monte
> • Journal, humeur, envies et déclencheurs, pour repérer tes moments à risque
> • Statistiques, calendrier et bilans hebdomadaires et mensuels
> • Fiches d’information sourcées (OMS, NIDA, HAS, NICE…) et page « Quand consulter »
> • Rappels discrets et personnalisables
> • Santé Apple (facultatif) : ton activité et ton sommeil à côté de ton suivi
> • 19 langues
>
> Gratuit, sans abonnement : tous les outils sont accessibles. Tes données restent sur ton téléphone, chiffrées. Pas de compte, pas de publicité, pas de mesure d’audience.

> (Choix de positionnement tiré de l’analyse des avis des concurrents, voir `docs/ANALYSE-CONCURRENCE.md` : à garder vrai si un modèle payant est ajouté un jour.)
> LIBRE ne remplace pas un professionnel de santé. En cas d’urgence, appelle les secours. Pour l’alcool, les somnifères, les anxiolytiques ou les opioïdes, parle à un médecin avant d’arrêter.

**Mots-clés (App Store, 100 car.)** : arrêter de fumer,alcool,addiction,sobriété,cannabis,sevrage,envies,jours sans,journal,bien-être

## 5. Après la publication

- Chaque mise à jour : `VERSION` dans `libre/sw.js` (web), version et build (iOS), `versionCode` (Android).
- Vérifier chaque année la date de vérification des contenus médicaux (`HEALTH_CHECKED` dans `index.html`) et les numéros d’aide.

## Sources

- Apple, exigences SDK : https://developer.apple.com/news/upcoming-requirements/
- Apple, soumission : https://developer.apple.com/app-store/submitting/
- Apple, directives de revue : https://developer.apple.com/app-store/review/guidelines/
- Apple, manifestes de confidentialité : https://developer.apple.com/documentation/bundleresources/privacy-manifest-files
- Google Play, niveau d’API cible : https://support.google.com/googleplay/android-developer/answer/11926878
- Google Play, déclaration des applications de santé : https://support.google.com/googleplay/android-developer/answer/14738291
- Google Play, règlement sur les applications de santé : https://support.google.com/googleplay/android-developer/answer/13996367
- Capacitor 8, mise à jour : https://capacitorjs.com/docs/updating/8-0
