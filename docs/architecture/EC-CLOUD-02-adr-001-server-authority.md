# ADR-001 — Autorité serveur pour progression et économie

Statut : accepté

## Contexte
La v191 est une PWA statique et utilise `localStorage` pour des états qui auront une valeur compétitive/économique.

## Décision
Toute mutation officielle d'XP, ETS, étoiles, inventaire, progression, récompense, classement ou contribution de clan sera validée et persistée côté serveur. Le client reçoit l'état résultant.

## Conséquences
- La manipulation du navigateur ne suffit plus à obtenir une récompense officielle.
- Les opérations sensibles doivent être transactionnelles et idempotentes.
- Le mode hors ligne reste possible pour l'entraînement mais avec synchronisation contrôlée.
- Une couche d'API stable facilite un futur changement d'hébergeur.
