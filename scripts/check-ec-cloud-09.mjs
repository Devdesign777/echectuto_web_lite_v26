import fs from 'node:fs'
const files = [
  'apps/web/.env.example','apps/web/src/lib/supabase/client.ts','apps/web/src/lib/supabase/server.ts',
  'apps/web/src/lib/supabase/proxy.ts','apps/web/src/middleware.ts','apps/web/src/app/auth/actions.ts',
  'apps/web/src/app/auth/callback/route.ts','apps/web/src/app/auth/login/page.tsx',
  'apps/web/src/app/auth/sign-up/page.tsx','apps/web/src/app/auth/forgot-password/page.tsx',
  'apps/web/src/app/auth/update-password/page.tsx','apps/web/src/app/dashboard/page.tsx'
]
for (const f of files) if (!fs.existsSync(f)) throw new Error(`missing ${f}`)
const pkg = JSON.parse(fs.readFileSync('apps/web/package.json','utf8'))
if (!pkg.dependencies['@supabase/ssr'] || !pkg.dependencies['@supabase/supabase-js']) throw new Error('Supabase SSR deps missing')
const proxy = fs.readFileSync('apps/web/src/lib/supabase/proxy.ts','utf8')
if (!proxy.includes('getClaims()')) throw new Error('protected routes must verify claims')
const actions = fs.readFileSync('apps/web/src/app/auth/actions.ts','utf8')
for (const forbidden of ['service_role','SUPABASE_SERVICE_ROLE_KEY']) if (actions.includes(forbidden)) throw new Error('privileged secret leaked into auth actions')
if (!actions.includes('resetPasswordForEmail') || !actions.includes('signInWithPassword')) throw new Error('auth flows incomplete')
const mw = fs.readFileSync('apps/web/src/middleware.ts','utf8')
if (!mw.includes('export') || !mw.includes('middleware')) throw new Error('middleware.ts must export a middleware function')
if (!mw.includes('updateSession')) throw new Error('middleware.ts must call updateSession')
const callback = fs.readFileSync('apps/web/src/app/auth/callback/route.ts','utf8')
if (!callback.includes("rawNext.startsWith('/')")) throw new Error('callback route must validate next parameter to prevent open redirect')
console.log('EC-CLOUD-09 PASS: SSR auth shell, protected route, recovery flow and secret boundary present')
