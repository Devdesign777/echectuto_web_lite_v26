-- EC-CLOUD-08: player identity/auth bootstrap.
-- Supabase Auth owns credentials/sessions. Public tables only store game-facing identity.

alter table public.profiles
  add column if not exists username_changed_at timestamptz,
  add column if not exists locale text not null default 'fr-FR',
  add column if not exists onboarding_completed boolean not null default false;

alter table public.profiles
  add constraint profiles_locale_length check (char_length(locale) between 2 and 35);

-- Keep timestamps trustworthy without client cooperation.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

-- Auth bootstrap is deliberately SECURITY DEFINER because auth.users is not client-accessible.
-- A requested username is accepted only when it satisfies the same DB constraints.
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  requested_username text;
  fallback_username text;
begin
  requested_username := nullif(trim(new.raw_user_meta_data ->> 'username'), '');
  fallback_username := 'player_' || substr(replace(new.id::text, '-', ''), 1, 12);

  if requested_username is null
     or char_length(requested_username) < 3
     or char_length(requested_username) > 32
     or requested_username !~ '^[A-Za-z0-9_.-]+$' then
    requested_username := fallback_username;
  end if;

  insert into public.profiles (user_id, username, display_name, locale)
  values (
    new.id,
    requested_username,
    nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''),
    case
      when char_length(coalesce(nullif(trim(new.raw_user_meta_data ->> 'locale'), ''), 'fr-FR')) between 2 and 35
        then coalesce(nullif(trim(new.raw_user_meta_data ->> 'locale'), ''), 'fr-FR')
      else 'fr-FR'
    end
  );

  insert into public.player_balances (user_id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

-- Explicit username mutation path. The browser cannot UPDATE profiles directly.
create or replace function public.change_my_username(p_username text)
returns public.profiles
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_username text := trim(p_username);
  v_profile public.profiles;
begin
  if v_user_id is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;
  if char_length(v_username) < 3 or char_length(v_username) > 32
     or v_username !~ '^[A-Za-z0-9_.-]+$' then
    raise exception 'invalid username' using errcode = '22023';
  end if;

  update public.profiles
     set username = v_username,
         username_changed_at = now()
   where user_id = v_user_id
   returning * into v_profile;

  if not found then
    raise exception 'profile not found' using errcode = 'P0002';
  end if;
  return v_profile;
exception
  when unique_violation then
    raise exception 'username unavailable' using errcode = '23505';
end;
$$;

revoke all on function public.change_my_username(text) from public;
grant execute on function public.change_my_username(text) to authenticated;

-- Public username availability must not disclose emails or auth identities.
create or replace function public.is_username_available(p_username text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select case
    when p_username is null
      or char_length(trim(p_username)) < 3
      or char_length(trim(p_username)) > 32
      or trim(p_username) !~ '^[A-Za-z0-9_.-]+$' then false
    else not exists (
      select 1 from public.profiles where lower(username) = lower(trim(p_username))
    )
  end;
$$;
revoke all on function public.is_username_available(text) from public;
grant execute on function public.is_username_available(text) to anon, authenticated;

-- Auth/session policy: credentials, password recovery, email verification and refresh tokens
-- remain Supabase Auth concerns. No password/token is copied into public schema.
