-- EC-CLOUD-07 executable database checks. Run after migrations in a Supabase/Postgres test database.
begin;

do $$
begin
  if to_regprocedure('public.finalize_validated_mission_attempt(uuid,text,uuid,jsonb)') is null then
    raise exception 'atomic finalization function missing';
  end if;
  if has_function_privilege('authenticated', 'public.finalize_validated_mission_attempt(uuid,text,uuid,jsonb)', 'EXECUTE') then
    raise exception 'authenticated browser role must not execute authoritative finalization';
  end if;
  if not has_function_privilege('service_role', 'public.finalize_validated_mission_attempt(uuid,text,uuid,jsonb)', 'EXECUTE') then
    raise exception 'service_role must execute authoritative finalization';
  end if;
end $$;

rollback;
