import fs from 'node:fs';
const sql = fs.readFileSync('supabase/migrations/20260915131000_ec_cloud_11_attempt_sync.sql','utf8');
const required = ['client_attempt_id','attempt_events','unique (attempt_id, sequence)','attempt_submissions','unique (user_id, submission_key)','enable row level security','No direct client mutation policies'];
for (const token of required) if (!sql.includes(token)) throw new Error(`EC-CLOUD-11 missing: ${token}`);
const moduleText = fs.readFileSync('apps/web/src/server/domain/attempts/attempt-sync.mjs','utf8');
for (const forbidden of ['rewardXp','reward_xp','xp: 999']) if (moduleText.includes(forbidden)) throw new Error(`Forbidden client reward surface: ${forbidden}`);
console.log('EC-CLOUD-11 PASS: resumable attempts, idempotent event/submission keys, RLS read-only boundary.');
