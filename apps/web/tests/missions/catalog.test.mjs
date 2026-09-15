import test from 'node:test'; import assert from 'node:assert/strict';
import {MISSION_CATALOG,getMission,getCertifiedMission,toChessValidationMission} from '../../src/server/domain/missions/catalog.mjs';
import {positionFingerprint,validateMissionEvidence} from '../../src/server/domain/chess/authoritative-chess.mjs';
test('catalog ids and id/version pairs are unique',()=>{assert.equal(new Set(MISSION_CATALOG.map(m=>m.id)).size,MISSION_CATALOG.length);assert.equal(new Set(MISSION_CATALOG.map(m=>`${m.id}@${m.version}`)).size,MISSION_CATALOG.length)});
test('legacy interaction missions are draft, not server-certified chess evidence',()=>{assert.equal(getMission('world1-1').status,'draft');assert.equal(getCertifiedMission('world1-1'),null)});
test('certified chess definitions carry a matching authoritative fingerprint',()=>{for(const m of MISSION_CATALOG.filter(m=>m.status==='certified')) assert.equal(m.definition.positionFingerprint,positionFingerprint(m.definition.position))});
test('catalog definitions are immutable at runtime',()=>{const m=getMission('world3-1');assert.equal(Object.isFrozen(m),true);assert.equal(Object.isFrozen(m.definition.position),true)});
test('certified catalog mission validates its expected move',()=>{const c=getCertifiedMission('world3-1');const mission=toChessValidationMission(c);const r=validateMissionEvidence({mission,evidence:{missionId:c.id,positionFingerprint:c.definition.positionFingerprint,move:c.definition.expectedMove}});assert.equal(r.passed,true)});
test('unknown mission versions fail closed',()=>assert.equal(getMission('world3-1',999),null));
