import test from 'node:test';
import assert from 'node:assert/strict';
import { getCertifiedMission, toChessValidationMission } from '../../src/server/domain/missions/catalog.mjs';
import { positionFingerprint, validateMissionEvidence, isCheckmate, isInCheck } from '../../src/server/domain/chess/authoritative-chess.mjs';

function validate(id){
  const catalog=getCertifiedMission(id); assert.ok(catalog, `${id} must be certified`);
  const mission=toChessValidationMission(catalog);
  const evidence={missionId:id,positionFingerprint:positionFingerprint(mission.position),move:mission.expectedMove};
  return {catalog,mission,result:validateMissionEvidence({mission,evidence})};
}

test('world 4 has five certified authoritative missions',()=>{
  for(let i=1;i<=5;i++) assert.ok(getCertifiedMission(`world4-${i}`));
});

test('world4-1 starts in check and the certified move escapes check',()=>{
  const {mission,result}=validate('world4-1'); assert.equal(isInCheck(mission.position,'white'),true); assert.equal(result.passed,true); assert.equal(isInCheck(result.finalPosition,'white'),false);
});

test('world4-2 closes the king escapes with mate',()=>{const {result}=validate('world4-2');assert.equal(result.passed,true);assert.equal(isCheckmate(result.finalPosition,'black'),true)});
test('world4-3 is an actual back-rank mate',()=>{const {result}=validate('world4-3');assert.equal(result.passed,true);assert.equal(isCheckmate(result.finalPosition,'black'),true)});
test('world4-4 demonstrates queen and king coordination with mate',()=>{const {result}=validate('world4-4');assert.equal(result.passed,true);assert.equal(isCheckmate(result.finalPosition,'black'),true)});
test('world4-5 is a distinct rook-and-bishop mate in one',()=>{const {result}=validate('world4-5');assert.equal(result.passed,true);assert.equal(isCheckmate(result.finalPosition,'black'),true)});

test('semantic objective rejects an exact move if its claimed mate is false',()=>{
  const mission={id:'tampered',sideToMove:'white',objective:'mate_in_one',position:{e1:'♔',a1:'♖',e8:'♚'},expectedMove:{from:'a1',to:'a8'}};
  const evidence={missionId:'tampered',positionFingerprint:positionFingerprint(mission.position),move:mission.expectedMove};
  const result=validateMissionEvidence({mission,evidence}); assert.equal(result.passed,false); assert.equal(result.reason,'mate_not_delivered');
});
