import test from 'node:test';
import assert from 'node:assert/strict';
import { getCertifiedMission, toChessValidationMission } from '../../src/server/domain/missions/catalog.mjs';
import { positionFingerprint, validateMissionEvidence, isLegalMove } from '../../src/server/domain/chess/authoritative-chess.mjs';

function validate(id){
  const catalog=getCertifiedMission(id); assert.ok(catalog, `${id} must be certified`);
  const mission=toChessValidationMission(catalog);
  const evidence={missionId:id,positionFingerprint:positionFingerprint(mission.position),move:mission.expectedMove};
  return {mission,result:validateMissionEvidence({mission,evidence})};
}

test('world 5 has six certified authoritative development missions',()=>{ for(let i=1;i<=6;i++) assert.ok(getCertifiedMission(`world5-${i}`)); });
test('world5-1 occupies the classical centre with a real pawn move',()=>{ const {result}=validate('world5-1'); assert.equal(result.passed,true); assert.equal(result.finalPosition.e4,'♙'); });
test('world5-2 develops a knight naturally',()=>{ const {result}=validate('world5-2'); assert.equal(result.passed,true); assert.equal(result.finalPosition.f3,'♘'); });
test('world5-3 develops the bishop on an active diagonal',()=>{ const {result}=validate('world5-3'); assert.equal(result.passed,true); assert.equal(result.finalPosition.c4,'♗'); });
test('world5-4 performs actual kingside castling and moves the rook too',()=>{ const {mission,result}=validate('world5-4'); assert.equal(isLegalMove(mission.position,mission.expectedMove,'white'),true); assert.equal(result.passed,true); assert.equal(result.finalPosition.g1,'♔'); assert.equal(result.finalPosition.f1,'♖'); assert.equal(result.finalPosition.h1,undefined); });
test('castling is rejected through an attacked transit square',()=>{ const position={e1:'♔',h1:'♖',f8:'♜',a8:'♚'}; assert.equal(isLegalMove(position,{from:'e1',to:'g1'},'white'),false); });
test('world5-5 rewards developing an untouched minor piece instead of wasting a tempo',()=>{ const {result}=validate('world5-5'); assert.equal(result.passed,true); assert.equal(result.finalPosition.d2,'♘'); });
test('world5-6 completes coordinated minor-piece development',()=>{ const {result}=validate('world5-6'); assert.equal(result.passed,true); assert.equal(result.finalPosition.c3,'♘'); });
