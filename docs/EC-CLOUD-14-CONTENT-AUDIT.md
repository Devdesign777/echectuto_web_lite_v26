# EC-CLOUD-14 — Audit automatique du contenu pédagogique v191

## Résultat
Le scanner lit directement les tableaux de missions de `app.js` sans exécuter le prototype. Il inventorie 73 missions standards réparties sur les 12 mondes et vérifie identifiants, récompenses, cases et couverture des mondes.

## Gate de certification
Une mission n'est jamais certifiée uniquement parce que sa structure est valide. Les missions avancées des mondes 4 à 12 qui demandent actuellement de cliquer une case explicitement nommée sont signalées `semantic-target-only` et recommandées pour quarantaine tant qu'une vraie position échiquéenne et une preuve serveur ne sont pas définies.

Les mondes 1–2 restent `draft` : leurs exercices d'interaction nécessitent un validateur serveur adapté. Les puzzles du monde 3 restent soumis à l'audit sémantique échiquéen EC-CLOUD-12/13.

## Suite
EC-CLOUD-15 devra créer le pipeline de promotion `draft/quarantined -> certified`, avec rapport d'audit par mission et impossibilité d'accorder une récompense officielle à un contenu non certifié.
