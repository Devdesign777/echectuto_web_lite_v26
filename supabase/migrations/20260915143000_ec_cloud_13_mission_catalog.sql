-- EC-CLOUD-13: immutable/versioned mission definitions.
create type public.mission_certification_status as enum ('draft', 'certified', 'quarantined', 'retired');
create table public.mission_versions (
  mission_id text not null references public.missions(id) on delete restrict,
  version integer not null check (version > 0),
  certification_status public.mission_certification_status not null default 'draft',
  kind text not null check (kind in ('interaction','chess_move','sequence','exam')),
  definition jsonb not null,
  definition_sha256 text not null check (definition_sha256 ~ '^[0-9a-f]{64}$'),
  certified_at timestamptz,
  created_at timestamptz not null default now(),
  primary key (mission_id, version),
  constraint mission_versions_definition_object check (jsonb_typeof(definition)='object'),
  constraint certified_requires_timestamp check (certification_status <> 'certified' or certified_at is not null)
);
create unique index mission_versions_definition_hash_unique on public.mission_versions(mission_id, definition_sha256);
alter table public.mission_versions enable row level security;
create policy mission_versions_select_certified on public.mission_versions for select to authenticated using (certification_status='certified');
-- No client write policy. Publication/certification remains a privileged server/admin operation.
