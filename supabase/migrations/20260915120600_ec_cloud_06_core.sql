-- EC-CLOUD-06: authoritative core schema for EchecTuto.
-- PostgreSQL/Supabase-ready. Auth identities remain owned by auth.users.

create extension if not exists pgcrypto;

create type public.attempt_status as enum ('started', 'submitted', 'passed', 'failed', 'abandoned');
create type public.ledger_asset as enum ('xp', 'ets', 'stars');
create type public.ledger_reason as enum ('mission_first_completion', 'admin_adjustment', 'migration');

create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  username text not null,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_username_length check (char_length(username) between 3 and 32),
  constraint profiles_username_format check (username ~ '^[A-Za-z0-9_.-]+$')
);
create unique index profiles_username_ci_unique on public.profiles (lower(username));

create table public.missions (
  id text primary key,
  title text not null,
  enabled boolean not null default true,
  reward_xp integer not null default 0 check (reward_xp >= 0),
  reward_stars integer not null default 0 check (reward_stars >= 0),
  definition jsonb not null default '{}'::jsonb,
  version integer not null default 1 check (version > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.mission_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  mission_id text not null references public.missions(id) on delete restrict,
  status public.attempt_status not null default 'started',
  evidence jsonb,
  validation_feedback jsonb,
  started_at timestamptz not null default now(),
  submitted_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz not null default now(),
  constraint mission_attempts_evidence_object check (evidence is null or jsonb_typeof(evidence) = 'object')
);
create index mission_attempts_user_mission_idx on public.mission_attempts(user_id, mission_id, created_at desc);

create table public.mission_completions (
  user_id uuid not null references auth.users(id) on delete cascade,
  mission_id text not null references public.missions(id) on delete restrict,
  first_attempt_id uuid not null references public.mission_attempts(id) on delete restrict,
  completed_at timestamptz not null default now(),
  primary key (user_id, mission_id),
  unique (first_attempt_id)
);
-- The PK is the anti-farming invariant: only one principal completion per user/mission.

create table public.player_balances (
  user_id uuid primary key references auth.users(id) on delete cascade,
  xp bigint not null default 0 check (xp >= 0),
  ets bigint not null default 0 check (ets >= 0),
  stars bigint not null default 0 check (stars >= 0),
  updated_at timestamptz not null default now()
);

create table public.economy_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  asset public.ledger_asset not null,
  amount bigint not null check (amount <> 0),
  reason public.ledger_reason not null,
  source_type text not null,
  source_id text not null,
  attempt_id uuid references public.mission_attempts(id) on delete restrict,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint economy_ledger_metadata_object check (jsonb_typeof(metadata) = 'object')
);
create index economy_ledger_user_created_idx on public.economy_ledger(user_id, created_at desc);
create unique index economy_ledger_mission_reward_once
  on public.economy_ledger(user_id, asset, source_type, source_id)
  where reason = 'mission_first_completion';

-- Client-readable ownership tables use RLS. Direct client writes are deliberately absent.
alter table public.profiles enable row level security;
alter table public.mission_attempts enable row level security;
alter table public.mission_completions enable row level security;
alter table public.player_balances enable row level security;
alter table public.economy_ledger enable row level security;
alter table public.missions enable row level security;

create policy profiles_select_own on public.profiles for select to authenticated using (auth.uid() = user_id);
create policy attempts_select_own on public.mission_attempts for select to authenticated using (auth.uid() = user_id);
create policy completions_select_own on public.mission_completions for select to authenticated using (auth.uid() = user_id);
create policy balances_select_own on public.player_balances for select to authenticated using (auth.uid() = user_id);
create policy ledger_select_own on public.economy_ledger for select to authenticated using (auth.uid() = user_id);
create policy missions_select_enabled on public.missions for select to authenticated using (enabled = true);

-- No INSERT/UPDATE/DELETE policies are granted to authenticated users for authoritative tables.
-- Mutations will go through server-side transactions/RPCs in the next phase.
