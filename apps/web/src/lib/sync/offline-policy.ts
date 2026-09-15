export const LOCAL_PREFERENCE_KEYS = new Set([
  'echectuto-theme',
  'echectuto-reduce-motion',
])

export const LEGACY_AUTHORITATIVE_PREFIXES = [
  'echectuto-economy-',
  'echectuto-world',
  'echectuto-game-profile-',
  'echectuto-live-challenges-',
  'echectuto-local-clan-',
]

export type SyncOperation = {
  id: string
  kind: 'preference'
  key: string
  value: string
  queuedAt: string
}

export function isLocalPreferenceKey(key: string): boolean {
  return LOCAL_PREFERENCE_KEYS.has(key)
}

export function isLegacyAuthoritativeKey(key: string): boolean {
  return LEGACY_AUTHORITATIVE_PREFIXES.some((prefix) => key.startsWith(prefix))
}

export function canQueueOfflineMutation(key: string): boolean {
  // Official progression/economy is never queued as a trusted mutation.
  return isLocalPreferenceKey(key) && !isLegacyAuthoritativeKey(key)
}
