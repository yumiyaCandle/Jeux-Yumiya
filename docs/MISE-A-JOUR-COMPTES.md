# Mise à jour : simplicité, navigation et comptes

Date : 26 novembre 2026. Tout ce qui existait est conservé : données, calculs, suivis, outils, SOS, journal, statistiques,
bibliothèque, Santé Apple, coffre chiffré natif, export/restauration. Rien n'a été supprimé : les sections longues de
l'accueil sont repliées dans « Mon parcours en détail ».

## 1. Aujourd'hui en chiffres

- Bandeau du jour : « Aucune consommation aujourd'hui », « Dans ta limite : 3 sur 10 » ou « Limite dépassée : demain est un nouveau jour ».
- Cartes de chiffres : jours sans, argent économisé, temps regagné, quantité évitée, objectif (%), meilleure série, jours réussis.
  Les cartes s'adaptent : pas de « jours sans » en réduction, « temps regagné » seulement pour les habitudes en temps (écrans),
  pas d'économies sans budget renseigné.
- Mini-graphique des 14 derniers jours (point = jour sans, barre = quantité notée), accès rapides Noter, Journal, SOS, Semaine.
- Historique (frise) et Personnaliser (choix et ordre des chiffres, mémorisés dans `prefs.dash`).
- Le conseil du jour est replié derrière « En savoir plus ».

## 2. Recherche globale

Bouton loupe en haut de chaque page principale. Index : pages, addictions, SOS et situations, exercices, articles,
statistiques (bilan, historique), journal, réglages (les 9 catégories du profil), notifications, favoris.
Filtres par catégorie. Un toucher ouvre directement l'élément (exercice, article, rubrique du profil dépliée).

## 3. Comptes (obligatoires quand le serveur est joignable)

Voir `server/README.md` pour le détail technique et la configuration.

| Écran | Contenu |
|---|---|
| Bienvenue | « Créer mon compte » et « J'ai déjà un compte » ; bouton de langue en haut |
| Création | onglets E-mail (adresse + mot de passe 10 caractères, code de confirmation) ou Téléphone (code SMS) |
| Clé de récupération | affichée une fois, à copier, case « J'ai noté ma clé » obligatoire |
| Connexion | e-mail + mot de passe, ou téléphone + code ; « Mot de passe oublié » |
| Ouverture des données | sur un nouvel appareil après une connexion par SMS ou une réinitialisation : saisie de la clé de récupération |
| Mon compte | e-mail, téléphone (ajout/modification par code), état de synchronisation, synchroniser, nouvelle clé de récupération, déconnexion, suppression définitive |

- **Migration** : une personne qui utilisait déjà LIBRE voit « Pour continuer, crée ton compte. Tes données actuelles y seront transférées ».
  Les données de l'appareil sont chiffrées puis envoyées ; rien n'est effacé. À la connexion sur un appareil qui a déjà des données,
  les deux sont fusionnées (éléments identifiés réunis, rien de perdu).
- **Synchronisation** : 2,5 s après chaque modification, au passage en arrière-plan, et à la reprise. Conflit (deux appareils) : fusion puis renvoi.
- **Hors serveur** (fichier LIBRE.html, aperçu, hébergement statique) : l'app le dit (« Le serveur de comptes n'est pas joignable… »)
  et fonctionne en local. Aucun faux compte n'est créé.
- **Profils de démonstration** : pas de compte demandé.

## 4. Langue

Bouton 🌐 FR en haut de l'accueil, sur l'écran de bienvenue et sur les écrans de compte (avant inscription ou connexion), et dans
Profil › Langue et région. Changement immédiat, mémorisé sur l'appareil et dans le compte : il est réappliqué à la connexion sur un autre appareil.

## 5. Profil en 9 catégories

Mon compte · Mes addictions (et leurs couleurs) · Mes objectifs (raisons, plan, conseils) · Mes notifications · Langue et région ·
Confidentialité et sécurité (chiffrement, verrouillage, mode discret) · Sauvegarde et récupération · Santé Apple · Assistance (proches, aide, politique, installation).

## 6. Notifications

Nouveaux rappels : **Résumé du jour** (une ligne de chiffres ; message neutre si l'écran verrouillé discret est activé),
**Encouragement** (seulement après un écart, une humeur basse ou un SOS dans les 3 derniers jours, au plus une fois tous les 3 jours),
**Si je ne note rien** (après 2, 3, 5 ou 7 jours, au choix). Chacun : activé ou non, heure, jours. Textes relus pour ne jamais culpabiliser.
Les rappels existants (quotidien, humeur, envies, motivation, objectifs, exercice, bilan, étapes, personnalisé) sont conservés.

## 7. Autres ajouts

- Favoris : articles (étoile dans l'article, section « Mes favoris » dans la bibliothèque) en plus des exercices ; catégorie « Favoris » dans la recherche.
- Bilan de la semaine (existant, avec comparaison à la semaine précédente) accessible en un toucher depuis l'accueil et la recherche.
- Mode discret (œil en haut de l'accueil, ou Profil › Confidentialité) : noms des addictions remplacés par « Suivi 1, 2… », chiffres floutés.
- Historique simplifié : frise par jour (consommations, étapes, journal, SOS, début de suivi), filtres, pagination.

## 8. Ce qui demande une configuration externe (non simulé)

| Élément | À fournir | Sans cela |
|---|---|---|
| Hébergement du serveur (HTTPS) | serveur Node 22 derrière un proxy HTTPS, domaine | l'app reste en mode local |
| Envoi des e-mails | compte chez un fournisseur compatible Resend, `MAIL_API_KEY`, `MAIL_FROM`, domaine vérifié | le serveur refuse de démarrer en production |
| Envoi des SMS | compte Twilio, `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM` | idem |
| Apps natives | `python3 tools/set-api.py https://api.votre-domaine` puis reconstruire ; `ALLOWED_ORIGINS=capacitor://localhost,https://localhost` | l'app native reste en mode local |
| Juridique | nom de l'éditeur, hébergeur, prestataires e-mail/SMS dans la politique de confidentialité | champs `[À COMPLÉTER]` |

## 9. Tests

- `npm run test:server` : 8 tests du serveur (mots de passe, codes, sessions, coffre, conflits, séparation des comptes, suppression, CORS, limitations).
- `npm run test:accounts` : parcours réels app + serveur dans des navigateurs séparés (inscription e-mail avec migration, connexion sur
  un 2e appareil et synchronisation, langue retrouvée, mot de passe oublié + clé de récupération, inscription SMS + clé, ajout d'un e-mail,
  déconnexion, suppression). Résultats : `tests/RESULTATS-COMPTES.md`.
- `npm run test:e2e` : suite existante + nouveaux tests (chiffres, personnalisation, recherche, mode discret, historique, favoris,
  notifications, profil, langue). Résultats : `tests/RESULTATS.md`.
- Non testé ici : envoi réel d'e-mails et de SMS (exige les clés), appareils physiques iPhone/Android.

## 10. Limites connues (à traiter avant une mise en production à grande échelle)

- Sur l'appareil, la clé de données du compte et le jeton de session sont gardés dans le stockage local de l'app (`libre.acct.v1`),
  au même niveau de protection que les données elles-mêmes sur le web (non chiffrées par défaut). Dans les apps natives, il serait
  préférable de les ranger dans le coffre natif (Keychain/Keystore) : à faire avant d'activer les comptes dans les apps natives.
- Fusion entre deux appareils modifiés hors ligne : les listes d'éléments identifiés sont réunies ; pour un même réglage modifié des
  deux côtés, la valeur de l'appareil qui synchronise en dernier l'emporte. Une suppression faite hors ligne sur un appareil peut
  réapparaître si l'autre appareil avait encore l'élément.
- La limitation des tentatives est en mémoire (un seul processus serveur). Pour plusieurs instances, utiliser un stockage partagé.
- Les rappels « Résumé du jour » programmés sur le téléphone sont calculés au moment de la programmation (recalculés à chaque
  ouverture et après chaque modification) : si l'app n'est pas ouverte pendant plusieurs jours, le chiffre peut être approximatif.
- Le service worker n'intercepte jamais les appels `/v1/` (aucune donnée de compte en cache).
