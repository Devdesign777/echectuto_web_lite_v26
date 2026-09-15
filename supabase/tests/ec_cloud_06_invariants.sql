-- EC-CLOUD-06 executable invariant checks for a Supabase/Postgres test database.
begin;

-- Expected schema invariants. These fail loudly if a migration accidentally removes protection.
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.mission_completions'::regclass and contype = 'p'
  ) then raise exception 'mission_completions primary key missing'; end if;

  if not exists (
    select 1 from pg_indexes
    where schemaname = 'public' and indexname = 'economy_ledger_mission_reward_once'
  ) then raise exception 'ledger idempotency index missing'; end if;

  if not (select relrowsecurity from pg_class where oid = 'public.economy_ledger'::regclass) then
    raise exception 'RLS missing on economy_ledger';
  end if;
end $$;

rollback;
