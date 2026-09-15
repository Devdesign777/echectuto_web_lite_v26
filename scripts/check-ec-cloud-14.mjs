import fs from 'node:fs'; import {auditLegacyMissionSource,certificationRecommendation} from '../apps/web/src/server/domain/missions/legacy-content-audit.mjs';
const report=auditLegacyMissionSource(fs.readFileSync('app.js','utf8'));
if(report.summary.total!==73||report.summary.worlds!==12||report.summary.errors) throw new Error(`EC-CLOUD-14 failed: ${JSON.stringify(report.summary)}`);
const quarantine=report.missions.filter(m=>certificationRecommendation(m).status==='quarantined').length;
console.log(`EC-CLOUD-14 PASS — ${report.summary.total} missions / ${report.summary.worlds} worlds / ${report.summary.errors} structural errors / ${report.summary.warnings} semantic warnings / ${quarantine} quarantine recommendations`);
