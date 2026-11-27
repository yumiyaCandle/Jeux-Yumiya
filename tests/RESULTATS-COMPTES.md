# Tests des comptes (app + serveur réel)

Exécutés le 2026-11-27 12:29 UTC : Chromium (Playwright) contre server/ en mode test.
Les e-mails et SMS ne sont pas envoyés : le serveur de test les garde en mémoire et le test y lit les codes. L'envoi réel exige un fournisseur e-mail et un fournisseur SMS configurés (voir server/README.md).

**10 réussis sur 10.**

| Test | Résultat | Durée |
|---|---|---|
| Langue choisie avant l’inscription, depuis l’écran d’accueil | réussi | 5.1 s |
| Inscription par e-mail : code obligatoire, données locales migrées et chiffrées | réussi | 1.2 s |
| Connexion sur un autre appareil : mêmes données, puis modification synchronisée | réussi | 3.9 s |
| Langue mémorisée par le compte et retrouvée à la connexion | réussi | 1.5 s |
| Mot de passe oublié : nouveau mot de passe, données rouvertes par la clé de récupération | réussi | 2.2 s |
| Inscription par téléphone (SMS), puis connexion sur un autre appareil avec la clé de récupération | réussi | 2.0 s |
| Mon compte : ajouter un e-mail à un compte téléphone | réussi | 0.7 s |
| Déconnexion : synchronisation puis effacement de cet appareil | réussi | 0.5 s |
| Suppression définitive du compte et de ses données | réussi | 0.4 s |
| Aucune erreur dans la console sur tous les appareils | réussi | 0.0 s |
