# EC-CLOUD-09 — Next.js SSR authentication shell

Prepared locally without connecting a real Supabase project.

## Added
- Supabase SSR browser/server clients using cookie-based sessions.
- Next.js 16 `proxy.ts` token refresh and private-route gate using verified claims.
- Sign-up, login, logout and protected dashboard shell.
- PKCE callback route (`exchangeCodeForSession`).
- Password-reset request with generic outcome to reduce account enumeration.
- Password-update page for recovery sessions.
- `.env.example`; real `.env.local` remains ignored.

## Security boundary
No service-role key belongs in browser code or these user-session utilities. Official economy writes remain server-authoritative through the EC-CLOUD-05/07 path.

## Activation later
Create the Supabase project, copy Project URL + publishable key to `apps/web/.env.local`, configure allowed redirect URLs, install dependencies, then run typecheck/build and live auth integration tests.
