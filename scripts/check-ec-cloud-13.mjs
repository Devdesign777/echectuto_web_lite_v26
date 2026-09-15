import fs from 'node:fs';
const migration=fs.readFileSync('supabase/migrations/20260915143000_ec_cloud_13_mission_catalog.sql','utf8');
const catalog=fs.readFileSync('apps/web/src/server/domain/missions/catalog.mjs','utf8');
for(const token of ['mission_versions','definition_sha256','certification_status','mission_versions_select_certified']) if(!migration.includes(token)) throw new Error(`missing SQL invariant: ${token}`);
for(const token of ['status:\'certified\'','status:\'draft\'','positionFingerprint','getCertifiedMission']) if(!catalog.includes(token)) throw new Error(`missing catalog invariant: ${token}`);
console.log('EC-CLOUD-13 PASS — versioned mission catalog and certification boundary present.');
