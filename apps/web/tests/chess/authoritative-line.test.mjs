import test from 'node:test'; import assert from 'node:assert/strict';
import { validateAuthoritativeLine } from '../../src/server/domain/chess/authoritative-chess.mjs';
const position={e1:'♔',e2:'♙',e7:'♟',e8:'♚'};
const line=[{from:'e2',to:'e4'},{from:'e7',to:'e5'}];
test('authoritative line validates alternating legal plies',()=>{assert.equal(validateAuthoritativeLine({position,sideToMove:'white',expectedLine:line,evidenceLine:line}).passed,true)});
test('authoritative line rejects a changed opponent reply',()=>{const r=validateAuthoritativeLine({position,sideToMove:'white',expectedLine:line,evidenceLine:[line[0],{from:'e7',to:'e6'}]});assert.equal(r.passed,false);assert.equal(r.reason,'line_mismatch')});
test('authoritative line rejects truncated evidence',()=>{assert.equal(validateAuthoritativeLine({position,sideToMove:'white',expectedLine:line,evidenceLine:[line[0]]}).reason,'line_length_mismatch')});
