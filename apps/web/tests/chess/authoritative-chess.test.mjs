import test from 'node:test'; import assert from 'node:assert/strict';
import {isLegalMove,positionFingerprint,validateMissionEvidence} from '../../src/server/domain/chess/authoritative-chess.mjs';
const mission={id:'world3-1',sideToMove:'white',position:{b5:'♘',e8:'♚',a8:'♜',d8:'♛',g8:'♞',e1:'♔'},expectedMove:{from:'b5',to:'c7'}};
test('fingerprint is stable regardless of key order',()=>assert.equal(positionFingerprint({e1:'♔',e8:'♚'}),positionFingerprint({e8:'♚',e1:'♔'})));
test('accepts a legal objective move from the authoritative position',()=>assert.equal(validateMissionEvidence({mission,evidence:{missionId:'world3-1',positionFingerprint:positionFingerprint(mission.position),move:{from:'b5',to:'c7'}}}).passed,true));
test('rejects a client forged starting position',()=>assert.equal(validateMissionEvidence({mission,evidence:{missionId:'world3-1',positionFingerprint:positionFingerprint({e1:'♔',e8:'♚'}),move:{from:'b5',to:'c7'}}}).reason,'position_mismatch'));
test('rejects an illegal move even if the client claims success',()=>assert.equal(validateMissionEvidence({mission,evidence:{missionId:'world3-1',positionFingerprint:positionFingerprint(mission.position),move:{from:'b5',to:'b7'},passed:true}}).reason,'illegal_move'));
test('rejects a legal move that does not satisfy the mission objective',()=>{
 const m={id:'rook',sideToMove:'white',position:{a1:'♖',e1:'♔',e8:'♚'},expectedMove:{from:'a1',to:'a8'}};
 const r=validateMissionEvidence({mission:m,evidence:{missionId:'rook',positionFingerprint:positionFingerprint(m.position),move:{from:'a1',to:'a2'}}}); assert.equal(r.reason,'objective_not_met');
});
test('rejects moves that leave own king in check',()=>assert.equal(isLegalMove({e1:'♔',e2:'♖',e8:'♜',a8:'♚'},{from:'e2',to:'f2'},'white'),false));
test('sliding pieces cannot jump over occupied squares',()=>assert.equal(isLegalMove({a1:'♖',a2:'♙',e1:'♔',e8:'♚'},{from:'a1',to:'a8'},'white'),false));
