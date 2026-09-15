# EC-CLOUD-12 — Validation échiquéenne serveur

Le navigateur n'est pas une source de vérité pour la réussite d'une mission échiquéenne.

## Contrat
- Le serveur charge la position et le coup objectif depuis son propre catalogue de mission.
- Le client soumet seulement une preuve: identifiant de mission, empreinte de la position vue et coup joué.
- Le serveur vérifie l'empreinte, la légalité du coup (géométrie, occupation, couleur, roi non laissé en échec), puis l'objectif.
- Un champ client tel que `passed: true` est ignoré.
- Les récompenses ne sont déclenchées qu'après `passed: true` produit par ce validateur serveur.

## Portée EC-CLOUD-12
Le moteur couvre les mouvements standards nécessaires à la validation un-coup, y compris promotion et sécurité du roi. Roque, en-passant, répétition, règle des 50 coups et validation tactique multi-variantes seront ajoutés avec l'état complet de partie quand des missions l'exigeront.

## Audit du contenu v191
Les puzzles v191 restent la référence UX mais leur description pédagogique ne doit pas être considérée comme preuve de correction. Chaque position sera importée dans un catalogue serveur versionné et validée par tests avant d'être éligible aux récompenses officielles.
