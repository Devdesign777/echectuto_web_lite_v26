import test from 'node:test';
import assert from 'node:assert/strict';
import { getCertifiedMission, toChessValidationMission } from '../../src/server/domain/missions/catalog.mjs';
import { positionFingerprint, validateMissionEvidence } from '../../src/server/domain/chess/authoritative-chess.mjs';

function validate(id){
  const catalog=getCertifiedMission(id); assert.ok(catalog, `${id} must be certified`);
  const mission=toChessValidationMission(catalog);
  return validateMissionEvidence({mission,evidence:{missionId:id,positionFingerprint:positionFingerprint(mission.position),move:mission.expectedMove}});
}

test('world 7 has seven certified authoritative endgame missions',()=>{ for(let i=1;i<=7;i++) assert.ok(getCertifiedMission(`world7-${i}`)); });
test('world7-1 activates the king toward the centre',()=>{ const r=validate('world7-1'); assert.equal(r.passed,true); assert.equal(r.finalPosition.e4,'♔'); });
test('world7-2 creates a passed pawn by capturing the last adjacent blocker',()=>{ const r=validate('world7-2'); assert.equal(r.passed,true); assert.equal(r.finalPosition.e6,'♙'); });
test('world7-3 enters the rule-of-square catch zone',()=>{ const r=validate('world7-3'); assert.equal(r.passed,true); assert.equal(r.finalPosition.e5,'♔'); });
test('world7-4 takes direct opposition',()=>{ const r=validate('world7-4'); assert.equal(r.passed,true); assert.equal(r.finalPosition.e5,'♔'); });
test('world7-5 places the rook behind the passed pawn',()=>{ const r=validate('world7-5'); assert.equal(r.passed,true); assert.equal(r.finalPosition.d1,'♖'); });
test('world7-6 advances safely without stalemating the defender',()=>{ const r=validate('world7-6'); assert.equal(r.passed,true); assert.equal(r.finalPosition.g7,'♙'); });
test('world7-7 activates the king to support conversion of the extra pawn',()=>{ const r=validate('world7-7'); assert.equal(r.passed,true); assert.equal(r.finalPosition.c6,'♔'); });
test('world7 rejects a client-selected alternative even if it is legal',()=>{ const c=getCertifiedMission('world7-1'); const m=toChessValidationMission(c); const r=validateMissionEvidence({mission:m,evidence:{missionId:m.id,positionFingerprint:positionFingerprint(m.position),move:{from:'d3',to:'c4'}}}); assert.equal(r.passed,false); });
