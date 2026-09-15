# EC-CLOUD-13 — Catalogue serveur versionné des missions

## Décision
Une mission officielle n'est plus définie par le JavaScript affiché dans le navigateur. Le serveur référence un couple `mission_id + version` et une définition immuable. Les statuts sont `draft`, `certified`, `quarantined`, `retired`.

Seules les missions `certified` peuvent alimenter une validation officielle et une récompense. Une modification pédagogique ou échiquéenne crée une nouvelle version au lieu d'écraser l'ancienne, afin que les anciennes tentatives restent auditables.

## Premier lot importé
- Monde 01, missions 1–5 : importées comme **draft**. Elles utilisent des validations d'interaction de la v191 et doivent recevoir un validateur serveur dédié avant certification.
- Monde 03, mission 1 : **certified chess_move v1** après validation légale et test adversarial EC-CLOUD-12.
- Monde 03, missions 2–5 : importées comme **draft**. Elles sont légalement représentables, mais restent à auditer sur la vérité pédagogique du motif annoncé avant certification. Chaque position reçoit néanmoins une empreinte SHA-256 côté serveur.

## Règles
Le client peut lire une mission publiée, mais ne peut ni publier, ni certifier, ni modifier une définition. Les récompenses restent portées par le catalogue autoritaire `missions`; le client n'envoie jamais un montant faisant foi.

## Suite
Importer les mondes restants par lots, exécuter un audit échiquéen et pédagogique, mettre en quarantaine toute position incohérente, puis certifier seulement après tests adversariaux.
