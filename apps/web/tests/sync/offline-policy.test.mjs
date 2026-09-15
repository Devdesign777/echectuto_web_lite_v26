import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'

const source = fs.readFileSync(new URL('../../src/lib/sync/offline-policy.ts', import.meta.url), 'utf8')

test('only visual preferences are allowlisted for offline mutation', () => {
  assert.match(source, /echectuto-theme/)
  assert.match(source, /echectuto-reduce-motion/)
})

test('legacy economy and progression namespaces are explicitly untrusted', () => {
  for (const marker of ['echectuto-economy-', 'echectuto-world', 'echectuto-game-profile-', 'echectuto-live-challenges-', 'echectuto-local-clan-']) {
    assert.ok(source.includes(marker), marker)
  }
})

test('offline queue cannot authorize official progression', () => {
  assert.match(source, /return isLocalPreferenceKey\(key\) && !isLegacyAuthoritativeKey\(key\)/)
})
