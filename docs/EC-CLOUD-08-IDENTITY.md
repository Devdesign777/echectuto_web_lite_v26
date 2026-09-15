# EC-CLOUD-08 — Identité joueur et authentification

Supabase Auth sera la source d'autorité pour l'e-mail, le mot de passe, les sessions, la vérification d'e-mail et la récupération de compte. EchecTuto ne stocke aucun mot de passe ni jeton dans ses tables publiques.

À la création d'un utilisateur Auth, un trigger transactionnel crée automatiquement `profiles` et `player_balances`. Le pseudonyme demandé est validé par la base ; à défaut, un pseudonyme technique non sensible est généré. L'unicité reste insensible à la casse grâce à l'index existant.

Le navigateur dispose uniquement de lectures RLS de ses données. Le changement de pseudonyme passe par `change_my_username()`, lié à `auth.uid()`. La vérification de disponibilité expose uniquement un booléen et aucune donnée d'authentification.

La connexion réelle à un projet Supabase, les URL de redirection, SMTP, CAPTCHA/rate limiting et les politiques de durée de session seront configurés lors du branchement cloud ; aucun secret n'est ajouté au dépôt local.
