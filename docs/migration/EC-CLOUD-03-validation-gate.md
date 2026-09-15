# EC-CLOUD-03 — Gate de non-régression avant migration

## But
Créer un minimum de contrôles reproductibles avant l'introduction de Next.js et du backend. Le prototype v191 reste exécutable tel quel.

## Contrôles automatisés présents
- fichiers fondamentaux présents et non vides ;
- cache Service Worker attendu en v191 ;
- syntaxe JavaScript vérifiable avec `node --check app.js` ;
- manifeste JSON valide ;
- absence d'identifiants HTML dupliqués ;
- existence des ressources locales référencées par `index.html` ;
- présence des marqueurs fonctionnels majeurs de la v191.

## Commandes
`./scripts/validate-static-baseline.sh`
`python3 scripts/validate-prototype.py`
`node --check app.js`

## Limite
Ces tests sont structurels, pas des tests de gameplay navigateur. EC-CLOUD-04 devra introduire un environnement applicatif parallèle et, avant migration des règles sensibles, des tests de domaine pour économie/progression.
