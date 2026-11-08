-- EC-CLOUD-11: resumable/idempotent mission attempts and server submission boundary.

alter table public.mission_attempts
  add column client_attempt_id uuid,
  add column mission_version integer,
  add column last_sequence integer not null default 0 check (last_sequence >= 0),
  add column updated_at timestamptz not null default now();

create unique index mission_attempts_client_id_once
  on public.mission_attempts(user_id, client_attempt_id)
  where client_attempt_id is not null;

create table public.attempt_events (
  id bigint generated always as identity primary key,
  attempt_id uuid not null references public.mission_attempts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  sequence integer not null check (sequence > 0),
  event_type text not null check (event_type in ('move', 'answer', 'checkpoint')),
  payload jsonb not null,
  created_at timestamptz not null default now(),
  constraint attempt_events_payload_object check (jsonb_typeof(payload) = 'object'),
  unique (attempt_id, sequence)
);
create index attempt_events_user_attempt_idx on public.attempt_events(user_id, attempt_id, sequence);

create table public.attempt_submissions (
  id uuid primary key default gen_random_uuid(),
  submission_key uuid not null,
  attempt_id uuid not null references public.mission_attempts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  evidence jsonb not null default '{}'::jsonb,
  status text not null default 'received' check (status in ('received','validated','rejected')),
  result jsonb,
  created_at timestamptz not null default now(),
  validated_at timestamptz,
  unique (user_id, submission_key),
  constraint attempt_submissions_evidence_object check (jsonb_typeof(evidence) = 'object'),
  constraint attempt_submissions_result_object check (result is null or jsonb_typeof(result) = 'object')
);
create index attempt_submissions_attempt_idx on public.attempt_submissions(attempt_id, created_at desc);

create trigger mission_attempts_set_updated_at
before update on public.mission_attempts
for each row execute function public.set_updated_at();

alter table public.attempt_events enable row level security;
alter table public.attempt_submissions enable row level security;
create policy attempt_events_select_own on public.attempt_events for select to authenticated using (auth.uid() = user_id);
create policy attempt_submissions_select_own on public.attempt_submissions for select to authenticated using (auth.uid() = user_id);
-- No direct client mutation policies. Server/API owns starts, event ingestion, submissions and validation.
