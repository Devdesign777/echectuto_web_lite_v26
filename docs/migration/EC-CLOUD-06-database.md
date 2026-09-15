# EC-CLOUD-06 gate

Status: schema prepared locally; no cloud account required.

Artifacts:
- `supabase/migrations/20260915120600_ec_cloud_06_core.sql`
- `supabase/tests/ec_cloud_06_invariants.sql`
- `docs/database/EC-CLOUD-06-core-schema.md`

The migration intentionally adds no client-side database credentials and no service-role secret.
