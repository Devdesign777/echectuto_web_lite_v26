-- Static/integration assertions for EC-CLOUD-15; intended for a disposable Supabase test DB.
do $$ begin
  if not exists (select 1 from pg_proc where proname='certify_mission_version') then raise exception 'certification function missing'; end if;
  if not exists (select 1 from pg_proc where proname='quarantine_mission_version') then raise exception 'quarantine function missing'; end if;
end $$;
