import fs from 'node:fs';
const engine=fs.readFileSync('apps/web/src/server/domain/chess/authoritative-chess.mjs','utf8');
const tests=fs.readFileSync('apps/web/tests/chess/authoritative-chess.test.mjs','utf8');
const required=['positionFingerprint','isLegalMove','validateMissionEvidence','position_mismatch','illegal_move','objective_not_met'];
for(const token of required) if(!engine.includes(token)) throw new Error(`missing chess gate token: ${token}`);
if(!tests.includes('client forged')||!tests.includes('leave own king in check')) throw new Error('missing adversarial chess tests');
console.log('EC-CLOUD-12 PASS — authoritative chess evidence gate present');
