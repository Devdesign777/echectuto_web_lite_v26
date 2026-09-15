# EC-CLOUD-06 — PostgreSQL authoritative core

## Goal
Prepare the first Supabase/PostgreSQL migration without requiring a Supabase account yet. The schema moves official progression/economy authority away from browser storage.

## Tables
- `profiles`: public game identity linked to `auth.users`.
- `missions`: server-owned mission catalog and reward source.
- `mission_attempts`: immutable-ish attempt trail/evidence.
- `mission_completions`: one first completion per `(user_id, mission_id)`; primary anti-farming invariant.
- `player_balances`: materialized current balances for fast reads.
- `economy_ledger`: auditable source of every XP/ETS/star mutation.

## Security boundaries
The authenticated browser receives SELECT-only RLS policies for its own records and enabled missions. It receives no direct write policy for balances, ledger, completions, or attempts. Server-side transactions will own mutations.

A forged browser request therefore cannot directly update `player_balances` or insert a fake ledger reward through the public authenticated database role.

## Economy invariants
1. Balances cannot be negative.
2. Reward amounts are not stored on attempts and are resolved from the server-owned mission definition.
3. `mission_completions` has a `(user_id, mission_id)` primary key: principal completion can only be claimed once.
4. `economy_ledger_mission_reward_once` prevents duplicate principal ledger entries per asset/source.
5. Ledger rows are append-oriented and attributable to a source and reason.

## Deliberately deferred
Authentication UX, server transaction/RPC implementation, admin policies, multiplayer/clans, purchases, subscriptions, achievement inventory, offline reconciliation, and production backup/monitoring are later gates.

## Apply later
When a Supabase project/local CLI is available, apply migrations in order and run the SQL invariant suite against a disposable database before staging/production.
