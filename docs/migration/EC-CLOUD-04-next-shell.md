# EC-CLOUD-04 — Squelette Next.js parallèle

## Objectif
Introduire la cible Next.js/React sans supprimer, réécrire ni rendre dépendante la baseline v191.

## Réalisation
- nouvelle application sous `apps/web` ;
- App Router + TypeScript strict ;
- répertoires `features`, `lib` et `server` conformes à l'architecture EC-CLOUD-02 ;
- copie de référence de la v191 sous `/legacy` pour comparaison ;
- aucune logique XP/ETS/récompense migrée à ce stade ;
- aucune clé, aucun compte cloud et aucun remote Git requis.

## Gate
La baseline racine doit continuer à passer EC-CLOUD-03. Les fichiers JSON/TypeScript du shell sont contrôlés structurellement. Le build Next.js n'est pas déclaré validé tant que les dépendances npm ne sont pas installées et figées dans un lockfile.

## Prochaine étape
EC-CLOUD-05 : extraire les contrats du domaine économie/progression et écrire les premiers tests de domaine avant toute persistance PostgreSQL.
