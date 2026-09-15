import fs from 'node:fs'
const required = [
  'apps/web/src/features/profile/server/get-player-snapshot.ts',
  'apps/web/src/features/profile/components/player-snapshot-cache.tsx',
  'apps/web/src/lib/sync/offline-policy.ts',
  'apps/web/src/lib/sync/player-cache.ts',
]
for (const file of required) if (!fs.existsSync(file)) throw new Error(`missing ${file}`)
const snapshot = fs.readFileSync(required[0], 'utf8')
for (const table of ['profiles', 'player_balances', 'mission_completions']) if (!snapshot.includes(table)) throw new Error(`snapshot missing ${table}`)
const cache = fs.readFileSync(required[3], 'utf8')
if (!cache.includes("authority: 'server-cache'")) throw new Error('cache authority marker missing')
console.log('EC-CLOUD-10 PASS — server snapshot + non-authoritative offline cache boundary present')
