# EchecTuto Web — Next.js migration shell

EC-CLOUD-04 introduit une application Next.js parallèle. La v191 reste intacte à la racine du dépôt et une copie de référence est servie sous `public/legacy` pour comparaison visuelle et fonctionnelle.

## Démarrage futur

```bash
cd apps/web
npm install
npm run dev
```

L'installation des dépendances n'est volontairement pas incluse dans le commit : elle devra être faite dans un environnement disposant du registre npm. Le premier `npm install` devra figer les versions dans un lockfile avant tout déploiement.
