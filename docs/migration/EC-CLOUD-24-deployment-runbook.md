# EC-CLOUD-24 — Deployment runbook

## Before cloud connection
1. Keep `v191-baseline` immutable.
2. Run `./scripts/final-local-gate.sh`.
3. Create a Supabase project only when the owner is ready.
4. Apply `supabase/migrations` in filename order to a staging project first.
5. Execute SQL invariant tests and verify RLS with authenticated and anonymous sessions.
6. Configure only `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in the web runtime. Administrative secrets must never enter client variables.
7. Install dependencies, commit the generated lockfile, run typecheck and production build.
8. Deploy a preview/staging build before production.

## Production gate
Production is blocked until: cloud credentials exist, migrations have run successfully in staging, recovery email redirects are configured, RLS tests pass against the real project, a dependency lockfile exists, `next build` passes, backup/restore is exercised, and remaining pedagogical draft/quarantined missions are not allowed to award official rewards.

## Rollback
The legacy v191 prototype remains recoverable through tag `v191-baseline`. Database changes are forward migrations; production rollback must use a tested compensating migration or restore, never destructive ad-hoc edits.
