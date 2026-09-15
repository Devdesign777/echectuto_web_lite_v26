import test from 'node:test';
import assert from 'node:assert/strict';
import { getCertifiedMission, toChessValidationMission } from '../../src/server/domain/missions/catalog.mjs';
import { positionFingerprint, validateMissionEvidence } from '../../src/server/domain/chess/authoritative-chess.mjs';

function validate(id){
  const catalog=getCertifiedMission(id); assert.ok(catalog, `${id} must be certified`);
  const mission=toChessValidationMission(catalog);
  const evidence={missionId:id,positionFingerprint:positionFingerprint(mission.position),move:mission.expectedMove};
  return validateMissionEvidence({mission,evidence});
}

test('world 6 has six certified authoritative strategy missions',()=>{ for(let i=1;i<=6;i++) assert.ok(getCertifiedMission(`world6-${i}`)); });
test('world6-1 turns pawn-structure reading into a central structural break',()=>{ const r=validate('world6-1'); assert.equal(r.passed,true); assert.equal(r.finalPosition.d5,'♙'); });
test('world6-2 creates a supported knight outpost that enemy pawns cannot chase',()=>{ const r=validate('world6-2'); assert.equal(r.passed,true); assert.equal(r.finalPosition.e5,'♘'); });
test('world6-3 places a rook on a genuinely open file',()=>{ const r=validate('world6-3'); assert.equal(r.passed,true); assert.equal(r.finalPosition.d1,'♖'); assert.equal(Object.entries(r.finalPosition).some(([sq,p])=>sq[0]==='d' && ['♙','♟'].includes(p)),false); });
test('world6-4 gains space with a forward pawn advance',()=>{ const r=validate('world6-4'); assert.equal(r.passed,true); assert.equal(r.finalPosition.e5,'♙'); });
test('world6-5 activates the undeveloped worst piece',()=>{ const r=validate('world6-5'); assert.equal(r.passed,true); assert.equal(r.finalPosition.c3,'♘'); });
test('world6-6 executes a central strategic pawn break as the plan',()=>{ const r=validate('world6-6'); assert.equal(r.passed,true); assert.equal(r.finalPosition.c5,'♙'); });
test('world6 server still rejects a client-selected alternative move',()=>{ const c=getCertifiedMission('world6-6'); const m=toChessValidationMission(c); const r=validateMissionEvidence({mission:m,evidence:{missionId:m.id,positionFingerprint:positionFingerprint(m.position),move:{from:'d4',to:'d5'}}}); assert.equal(r.passed,false); });
