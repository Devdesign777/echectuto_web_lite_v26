# EC-CLOUD-02 — Inventaire des données v191

## Critique : migrer vers le serveur
| Domaine | Clés v191 principales | Cible |
|---|---|---|
| Économie | `echectuto-economy-xp-v36`, `...coins...`, `...stars...` | ledger + wallet PostgreSQL |
| Progression aventure | `echectuto-world*-progress-*`, `echectuto-world*-boss-*` | mission_attempts / mission_completions |
| Profil de jeu | `echectuto-game-profile-v5` | player_profile / match_stats |
| Défis | `echectuto-live-challenges-v191` | challenges / challenge_progress |
| Clan | `echectuto-local-clan-v191` | clans / clan_memberships / contributions |
| Boutique/inventaire | owned/equipped/activity keys | catalog / inventory / transactions |

## Hybride : serveur + cache local
| Domaine | Clés | Traitement |
|---|---|---|
| Centre d'apprentissage | `echectuto-learning-center-v189` | état officiel serveur + cache |
| Erreurs/tendances | `echectuto-learning-patterns-v159` | synchronisation pédagogique |
| Centre de commande | `echectuto-command-*` | selon nature de chaque événement |
| Historique boutique UI | favorites/history/recent/compare | compte serveur si connecté, local sinon |

## Local acceptable
- `echectuto-theme`
- `echectuto-reduce-motion`
- préférences purement visuelles ou temporaires ne donnant aucun avantage officiel.

## Risque actuel
`app.js` lit et écrit directement les soldes, progressions et récompenses dans `localStorage`. Ces valeurs sont modifiables par le joueur et ne peuvent pas devenir une source de vérité de production.

## Migration des joueurs v191
La v191 n'a pas d'identité serveur fiable. Les données locales historiques doivent donc être considérées comme données de prototype. Lors de l'ouverture de comptes cloud, ne pas convertir automatiquement un solde local en valeur officielle sans politique d'import explicite.
