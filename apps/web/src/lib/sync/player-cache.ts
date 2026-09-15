import type { PlayerSnapshot } from '@/features/profile/server/get-player-snapshot'

export const PLAYER_SNAPSHOT_CACHE_KEY = 'echectuto-cloud-player-snapshot-v1'

export type CachedPlayerSnapshot = {
  snapshot: PlayerSnapshot
  cachedAt: string
  authority: 'server-cache'
}

export function cachePlayerSnapshot(snapshot: PlayerSnapshot): void {
  const value: CachedPlayerSnapshot = { snapshot, cachedAt: new Date().toISOString(), authority: 'server-cache' }
  localStorage.setItem(PLAYER_SNAPSHOT_CACHE_KEY, JSON.stringify(value))
}

export function readCachedPlayerSnapshot(): CachedPlayerSnapshot | null {
  const raw = localStorage.getItem(PLAYER_SNAPSHOT_CACHE_KEY)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as CachedPlayerSnapshot
    return parsed?.authority === 'server-cache' ? parsed : null
  } catch {
    return null
  }
}
