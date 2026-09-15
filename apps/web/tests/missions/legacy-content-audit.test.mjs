import test from 'node:test'; import assert from 'node:assert/strict'; import fs from 'node:fs';
import {auditLegacyMissionSource,certificationRecommendation} from '../../src/server/domain/missions/legacy-content-audit.mjs';
const source=fs.readFileSync(new URL('../../../../app.js',import.meta.url),'utf8'); const report=auditLegacyMissionSource(source);
test('legacy audit discovers all 12 worlds',()=>assert.equal(report.summary.worlds,12));
test('legacy audit discovers the expected 73 standard missions',()=>assert.equal(report.summary.total,73));
test('legacy mission identifiers and rewards have no structural errors',()=>assert.equal(report.summary.errors,0));
test('advanced target-only lessons are flagged rather than auto-certified',()=>{assert.ok(report.summary.warnings>=1);const m=report.missions.find(x=>x.legacyId==='world12-7');assert.equal(certificationRecommendation(m).status,'quarantined')});
test('world mission counts match the v191 source',()=>assert.deepEqual(report.summary.counts,{1:5,2:4,3:5,4:5,5:6,6:6,7:7,8:7,9:7,10:7,11:7,12:7}));
