import fs from 'node:fs';
const p='supabase/migrations/20260915124500_ec_cloud_08_identity.sql';
const s=fs.readFileSync(p,'utf8');
const checks=[
 ['auth trigger',/create trigger on_auth_user_created/i],
 ['profile bootstrap',/insert into public\.profiles/i],
 ['balance bootstrap',/insert into public\.player_balances/i],
 ['username rpc',/function public\.change_my_username/i],
 ['availability rpc',/function public\.is_username_available/i],
 ['security definer',/security definer/i],
 ['fixed search path',/set search_path = ''/i],
 ['authenticated grant',/grant execute on function public\.change_my_username\(text\) to authenticated/i],
 ['no direct profile write policy',! /create policy .*profiles.* for (insert|update|delete)/i.test(s)],
];
let bad=0;
for (const [name,test] of checks){const ok=typeof test==='boolean'?test:test.test(s); console.log(`${ok?'PASS':'FAIL'} ${name}`); if(!ok) bad++;}
if(bad) process.exit(1);
