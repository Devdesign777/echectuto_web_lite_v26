import fs from 'node:fs';
import assert from 'node:assert/strict';
const sql = fs.readFileSync(new URL('../supabase/migrations/20260915120600_ec_cloud_06_core.sql', import.meta.url), 'utf8');
for (const table of ['profiles','missions','mission_attempts','mission_completions','player_balances','economy_ledger']) {
  assert.match(sql, new RegExp(`create table public\\.${table}\\b`), `missing table ${table}`);
}
assert.match(sql, /primary key \(user_id, mission_id\)/, 'anti-farming completion key missing');
assert.match(sql, /economy_ledger_mission_reward_once/, 'ledger idempotency index missing');
assert.match(sql, /alter table public\.economy_ledger enable row level security/, 'ledger RLS missing');
assert.doesNotMatch(sql, /create policy .* for (insert|update|delete) to authenticated/i, 'authoritative client write policy detected');
console.log('EC-CLOUD-06 static schema gate: PASS');
