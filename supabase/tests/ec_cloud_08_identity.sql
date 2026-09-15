-- EC-CLOUD-08 executable assertions intended for a Supabase/Postgres test database.
begin;

do $$
begin
  if not exists (select 1 from pg_proc where proname = 'handle_new_auth_user') then raise exception 'missing auth bootstrap'; end if;
  if not exists (select 1 from pg_proc where proname = 'change_my_username') then raise exception 'missing username RPC'; end if;
  if not exists (select 1 from pg_proc where proname = 'is_username_available') then raise exception 'missing availability RPC'; end if;
  if exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='profiles'
      and column_name in ('password','password_hash','access_token','refresh_token')
  ) then raise exception 'credentials leaked into public.profiles'; end if;
end $$;

rollback;
