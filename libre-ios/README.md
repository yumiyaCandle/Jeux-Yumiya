# LIBRE – application iPhone (et Android)

Ce dossier transforme l’application web LIBRE (`../libre`) en application native avec **Capacitor**.
Elle apporte deux choses qu’une page web ou une PWA ne peut pas offrir :

| Fonction | Navigateur / PWA | Application native |
|---|---|---|
| Rappels quand l’app est fermée | Non (rappels seulement quand LIBRE est ouverte, les autres dans la cloche) | **Oui** : programmés sur l’appareil (14 jours, mis à jour à chaque ouverture) |
| Santé Apple (HealthKit) | **Impossible** : Apple ne l’autorise pas | **Oui** sur iPhone, en lecture seule, avec ton autorisation |

Le code web est **le même** : LIBRE détecte toute seule si elle tourne dans l’app native.
Aucun faux bouton : hors de l’app iPhone, la rubrique « Santé Apple » affiche « Indisponible ici ».

## Ce qu’il faut

- Un Mac avec **Xcode 16** ou plus récent, et **Node.js 20** ou plus récent.
- Un **compte Apple Developer** (payant) : HealthKit ne fonctionne qu’avec une app signée.
- Un **iPhone réel** : le simulateur n’a pas de vraies données Santé.

## Installation (iOS)

1. Dans ce dossier :
   ```bash
   npm install
   npm run web            # copie ../libre dans www/
   npx cap add ios        # crée le projet Xcode dans ios/
   ```
2. Copier les fichiers natifs fournis dans le projet Xcode :
   ```bash
   cp native/ios/LibreHealthPlugin.swift native/ios/MainViewController.swift ios/App/App/
   cp native/ios/App.entitlements ios/App/App/App.entitlements
   ```
3. Ouvrir Xcode : `npx cap open ios`. Dans le navigateur de fichiers d’Xcode, glisser
   `LibreHealthPlugin.swift` et `MainViewController.swift` dans le groupe **App** (cible « App » cochée).
4. **Info.plist** (`ios/App/App/Info.plist`) : ajouter les deux clés de `native/ios/Info.plist.ajouts.xml`
   (textes affichés par iOS dans la demande d’autorisation Santé).
5. **Main.storyboard** : sélectionner le *Bridge View Controller*, onglet *Identity Inspector*,
   *Custom Class* = `MainViewController`, *Module* = `App`. C’est ce qui enregistre le plugin `LibreHealth`.
6. Cible **App** › *Signing & Capabilities* :
   - choisir ton équipe (*Team*) et un identifiant unique (par défaut `ch.libre.app`) ;
   - **+ Capability › HealthKit** (Xcode utilise alors `App.entitlements`) ;
   - les notifications locales ne demandent aucune capability supplémentaire.
7. Brancher l’iPhone, le choisir comme destination, puis **Run**.
8. Après chaque modification de LIBRE : `npm run ios` (copie, synchronisation, ouverture d’Xcode).

## Vérifier sur l’iPhone

1. Créer un profil, puis **Profil › Notifications et rappels** :
   « Autoriser les notifications » → iOS demande l’autorisation → « Tester une notification »
   → elle arrive 5 secondes plus tard, **même si tu quittes l’app**.
2. **Profil › Santé Apple** : cocher les données → « Connecter Santé Apple » → feuille d’autorisation d’iOS
   → après autorisation, la synchronisation récupère jusqu’à 90 jours. « Voir mon suivi santé » affiche les graphiques.
3. Refus : dans Réglages › Santé › Accès aux données et appareils › LIBRE, couper l’accès. iOS ne dit jamais à
   une app qu’une lecture est refusée : LIBRE affiche alors « Connecté, aucune donnée reçue » et indique où vérifier.
4. Révocation : « Déconnecter et effacer ces données de LIBRE » arrête la lecture et efface les copies locales.
   L’autorisation elle-même se retire dans les Réglages d’iOS (une app ne peut pas la retirer seule).

## Données lues (uniquement celles cochées)

| Clé LIBRE | HealthKit | Résumé par jour |
|---|---|---|
| steps | stepCount | somme |
| distance | distanceWalkingRunning | somme (km) |
| exercise | appleExerciseTime | somme (min) |
| energy | activeEnergyBurned | somme (kcal) |
| sleep | sleepAnalysis (phases « endormi ») | heures, intervalles fusionnés (iPhone + montre comptés une fois), attribuées au jour du réveil |
| hr | heartRate | moyenne (bpm) |
| hrRest | restingHeartRate | moyenne (bpm) |
| hrv | heartRateVariabilitySDNN | moyenne (ms) |
| resp | respiratoryRate | moyenne (/min) |

Synchronisation sans doublons : chaque jour est stocké sous sa date (`AAAA-MM-JJ`) et **remplacé** à chaque
synchronisation ; LIBRE relit les 2 derniers jours pour compléter les valeurs tardives (montre synchronisée plus tard).

## Confidentialité et App Store

- Lecture seule ; aucune écriture dans Santé.
- Les données de santé restent dans le stockage local de LIBRE sur l’iPhone ; **aucun serveur**.
  Elles font partie de la sauvegarde exportée par l’utilisateur (fichier JSON qu’il garde lui-même).
- Règles Apple à respecter pour la publication : pas de publicité ni de revente à partir des données HealthKit,
  une **politique de confidentialité** accessible (obligatoire), et la déclaration « Santé et forme » dans
  les informations de confidentialité de l’App Store (données non liées à l’identité, non utilisées pour le suivi).

## Android

```bash
npm run web && npx cap add android && npx cap open android
```
Les **rappels programmés** fonctionnent (plugin Local Notifications ; sur Android 13+, l’autorisation est demandée
par le bouton de LIBRE). **Santé Apple n’existe pas sur Android** : la rubrique affiche « Indisponible ici ».
Une connexion à Health Connect (Google) serait un module séparé, non inclus.

## Ce qui n’a pas pu être vérifié ici

Ce projet a été préparé sans Mac ni iPhone. Le code JavaScript a été testé avec un plugin simulé
(autorisation, synchronisation, refus, révocation, graphiques), mais **le module Swift doit être compilé et
essayé sur un iPhone réel** avant toute publication.
