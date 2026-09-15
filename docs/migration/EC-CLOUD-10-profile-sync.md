# EC-CLOUD-10 — Profil serveur et synchronisation locale/cloud

## Objectif
Introduire une première tranche verticale de lecture cloud sans convertir le `localStorage` v191 en source de vérité.

## Réalisation
- snapshot serveur agrégé : profil, XP/ETS/étoiles et missions validées ;
- dashboard alimenté par ce snapshot ;
- copie navigateur explicitement marquée `server-cache` pour consultation hors ligne future ;
- allowlist des seules mutations locales actuellement sûres : thème et réduction des animations ;
- namespaces v191 économie/progression/clan/défis/profil explicitement classés non fiables ;
- aucune fusion automatique des soldes v191 avec les soldes cloud.

## Règle de conflit
Pour toute donnée officielle, **serveur gagne toujours**. Une valeur locale historique ne peut jamais augmenter XP, ETS, étoiles, progression, classement ou récompense. Les futures actions hors ligne de gameplay seront resoumises comme preuves/tentatives à valider par le serveur, jamais rejouées comme écritures économiques.

## Limite actuelle
Le cache utilise `localStorage` comme première abstraction simple. Une phase ultérieure pourra le déplacer vers IndexedDB/service worker pour de gros volumes et une vraie file de resoumission. Aucun projet Supabase réel n'est requis pour cette étape.
