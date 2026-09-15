# EC-CLOUD-02 — Architecture cible EchecTuto

## Décision
La v191 reste la baseline fonctionnelle. La migration sera incrémentale : aucune réécriture massive du prototype.

## Cible initiale
- Frontend : Next.js + React, PWA responsive.
- Backend : API serveur ; règles économiques et validations officielles côté serveur.
- Données : PostgreSQL (Supabase au démarrage), migrations SQL versionnées.
- Authentification : Supabase Auth au démarrage, encapsulée derrière une couche `auth` afin de limiter le verrouillage fournisseur.
- Déploiement : Vercel pour le frontend/API légère ; services persistants séparables ultérieurement.
- Edge/CDN : Cloudflare optionnel lorsque le besoin réel apparaît.

## Frontières d'autorité
### Client
Affichage, animations, sons, thème, préférences visuelles, interactions de l'échiquier, cache PWA et entraînements explicitement locaux.

### Serveur autoritaire
Compte, identité, progression officielle, XP/ETS/étoiles, inventaire officiel, récompenses, achats, défis officiels, clans, classements, compétitions, historique économique et règles anti-farming.

### Hybride
Missions, parties, Coach IA, apprentissage et mode hors ligne. Le client peut calculer une prévisualisation ; le serveur valide toute conséquence officielle.

## Flux de récompense cible
1. Le client soumet une tentative et ses preuves minimales.
2. L'API authentifie le joueur et valide la tentative.
3. Une transaction PostgreSQL applique anti-farming + récompense + progression + journal.
4. L'API retourne le nouvel état officiel.
5. Le client anime le résultat reçu ; il ne fabrique jamais le solde officiel.

## Stratégie hors ligne
- Les préférences et contenus d'entraînement peuvent rester locaux.
- Les événements hors ligne synchronisables sont placés dans une file avec identifiant idempotent.
- Une synchronisation ne crédite jamais directement l'économie : elle demande une validation serveur.
- Compétitions, achats, classements et récompenses sensibles nécessitent une connexion.

## Découpage applicatif visé
`src/app` : routes et écrans
`src/features/chess` : moteur/plateau
`src/features/adventure` : mondes et missions
`src/features/learning` : maîtrise et révisions
`src/features/challenges` : défis
`src/features/clans` : clans
`src/features/shop` : boutique
`src/features/coach` : Coach IA
`src/features/profile` : profil
`src/lib/storage` : stockage local non autoritaire
`src/lib/api` : client API
`src/server` : logique serveur
`supabase/migrations` : schéma versionné

## Règles de migration
1. Ne pas modifier la baseline `v191-baseline`.
2. Une capacité à la fois, avec commit isolé.
3. Conserver le comportement visible avant extraction d'un module.
4. Ajouter des tests de non-régression avant de déplacer l'économie/progression.
5. Aucun secret dans Git.
6. PostgreSQL et API restent suffisamment standards pour permettre une migration hors Supabase/Vercel.

## Ordre recommandé
EC-CLOUD-03 : harness de validation du prototype.
EC-CLOUD-04 : squelette Next.js parallèle sans suppression du prototype.
EC-CLOUD-05 : extraction du domaine économie et contrats API.
EC-CLOUD-06 : schéma PostgreSQL + migrations + RLS.
EC-CLOUD-07 : authentification.
EC-CLOUD-08 : progression/missions serveur.
EC-CLOUD-09 : boutique/inventaire/transactions.
EC-CLOUD-10 : défis/clans/classements.
EC-CLOUD-11 : synchronisation hors ligne.
EC-CLOUD-12 : staging Vercel/Supabase et tests.
