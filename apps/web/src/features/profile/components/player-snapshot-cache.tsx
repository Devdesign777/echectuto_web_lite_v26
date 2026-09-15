'use client'

import { useEffect } from 'react'
import type { PlayerSnapshot } from '../server/get-player-snapshot'
import { cachePlayerSnapshot } from '@/lib/sync/player-cache'

export function PlayerSnapshotCache({ snapshot }: { snapshot: PlayerSnapshot }) {
  useEffect(() => { cachePlayerSnapshot(snapshot) }, [snapshot])
  return null
}
