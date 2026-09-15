# EC-CLOUD-05 — Progression, économie et anti-farming

## Objectif
Créer le premier noyau serveur autoritaire avant toute connexion à PostgreSQL/Supabase.
La v191 reste la référence fonctionnelle et n'est pas modifiée pendant cette étape.

## Décisions figées
- Le client ne transmet jamais un montant de récompense digne de confiance.
- XP, ETS et étoiles proviennent de la définition de mission détenue par le serveur.
- La validation de réussite appartient au serveur.
- La première validation d'une mission peut recevoir la récompense principale.
- Une répétition reste jouable mais reçoit 0 XP / 0 ETS / 0 étoile principale dans ce contrat.
- `claimFirstCompletion` est un port atomique : PostgreSQL devra garantir l'idempotence avec une contrainte unique/transaction.
- `attemptId` prépare l'idempotence, l'audit et les futurs contrôles anti-triche.

## Compatibilité v191
La politique ETS reproduit la règle actuelle : `max(1, round(XP / 20))` lorsqu'une récompense XP positive est accordée.
Le stockage local actuel n'est pas supprimé : il restera utilisé par le prototype legacy jusqu'à la migration d'une tranche verticale complète.

## Prochaine étape
EC-CLOUD-06 doit traduire ces ports en schéma PostgreSQL : profils, missions, tentatives, validations, progression, ledger économique et contraintes d'idempotence. Aucun secret ni projet Supabase réel n'est requis pour définir et tester ce schéma localement.
