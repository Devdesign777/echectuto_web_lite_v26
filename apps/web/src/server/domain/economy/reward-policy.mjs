/**
 * Server-side reward policy.
 * The client may display rewards, but it must never choose their amounts.
 */
export function normalizeNonNegativeInteger(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.trunc(n));
}

export function rewardFromMissionDefinition(mission) {
  if (!mission || typeof mission !== 'object') {
    throw new TypeError('mission definition is required');
  }

  const xp = normalizeNonNegativeInteger(mission.rewardXp);
  const ets = xp > 0 ? Math.max(1, Math.round(xp / 20)) : 0;
  const stars = normalizeNonNegativeInteger(mission.rewardStars ?? 0);

  return Object.freeze({ xp, ets, stars });
}

export const ZERO_REWARD = Object.freeze({ xp: 0, ets: 0, stars: 0 });
