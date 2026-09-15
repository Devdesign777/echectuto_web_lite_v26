# EC-CLOUD-01 — Audit & gel du prototype v191

## Baseline
- Source: `EchecTuto_Web_Lite_Immersif_v191_DeepAudit_AllSections_Fixed.zip`
- Architecture observée: application web statique / PWA sans backend.
- Fichiers principaux: `index.html`, `app.js`, `styles.css`, `sw.js`, `manifest.webmanifest`.
- Le prototype v191 est conservé comme baseline avant migration cloud.

## Constats structurants
1. La progression et l'économie sont actuellement persistées côté navigateur via `localStorage` (XP, monnaies, progression des mondes, boss, préférences, boutique, etc.).
2. Les récompenses et validations de missions/boss sont attribuées par le JavaScript client. Cette autorité doit migrer côté serveur avant toute économie, compétition ou classement officiel public.
3. Le Coach IA actuel est local/simulé dans le prototype.
4. Le service worker fournit déjà une base PWA/offline et renouvelle le cache de l'application.
5. Aucun backend, schéma PostgreSQL, authentification serveur ou migration de base de données n'est présent dans cette baseline.

## Décision d'architecture
Migration progressive, sans réécriture brutale du prototype.

### Reste principalement côté client
- rendu de l'échiquier et interactions immédiates;
- animations, thèmes et accessibilité visuelle;
- cache/offline et ressources PWA;
- feedback instantané non autoritaire.

### Devient autoritaire côté serveur
- comptes et identité joueur;
- progression officielle;
- XP, monnaies et récompenses;
- inventaire et achats;
- classements, clans, compétitions;
- validation des événements économiques et contrôles anti-triche.

### Hybride
- missions et parties;
- défis;
- Coach IA;
- synchronisation offline/online.

## Garde-fous de migration
- Ne jamais committer de secrets ou clés API.
- Utiliser des variables d'environnement pour les secrets et versionner seulement un exemple sans secret.
- Conserver PostgreSQL et des interfaces d'API portables afin de limiter le verrouillage fournisseur.
- Ne pas supprimer le fonctionnement offline lors de l'introduction du cloud.
- Conserver la v191 comme référence fonctionnelle et visuelle.

## Gates avant préproduction publique
- backend/API créé;
- authentification serveur créée;
- schéma PostgreSQL et migrations versionnés;
- politiques d'accès aux données testées;
- économie et récompenses validées côté serveur;
- stratégie de synchronisation définie;
- sauvegardes/restauration et observabilité définies;
- tests fonctionnels et sécurité réalisés.

## Prochaine étape
EC-CLOUD-02: définir l'architecture cible et le plan de migration incrémental avant toute connexion à un dépôt Git distant ou à un hébergeur.
