import { rewardFromMissionDefinition, ZERO_REWARD } from '../economy/reward-policy.mjs';

function requireText(value, field) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new TypeError(`${field} is required`);
  }
  return value.trim();
}

/**
 * Authoritative mission-completion use case.
 *
 * Security boundary:
 * - request contains identifiers/evidence only, never trusted reward values;
 * - mission catalog is server-owned;
 * - validator is server-owned;
 * - claimFirstCompletion must be atomic in the database;
 * - only the first successful completion receives the principal reward.
 */
export async function completeMission(request, deps) {
  const userId = requireText(request?.userId, 'userId');
  const missionId = requireText(request?.missionId, 'missionId');
  const attemptId = requireText(request?.attemptId, 'attemptId');

  const mission = await deps.missions.getById(missionId);
  if (!mission || mission.enabled === false) {
    return { ok: false, code: 'MISSION_NOT_AVAILABLE' };
  }

  const validation = await deps.validator.validate({
    userId,
    mission,
    attemptId,
    evidence: request.evidence ?? null,
  });

  if (!validation?.passed) {
    return {
      ok: false,
      code: 'MISSION_NOT_PASSED',
      feedback: validation?.feedback ?? null,
    };
  }

  const firstCompletion = await deps.progress.claimFirstCompletion({
    userId,
    missionId,
    attemptId,
    completedAt: deps.clock.now(),
  });

  if (!firstCompletion) {
    return {
      ok: true,
      code: 'REPLAY_COMPLETED',
      firstCompletion: false,
      reward: ZERO_REWARD,
    };
  }

  const reward = rewardFromMissionDefinition(mission);
  await deps.economy.grantMissionReward({
    userId,
    missionId,
    attemptId,
    reward,
  });

  return {
    ok: true,
    code: 'FIRST_COMPLETION_REWARDED',
    firstCompletion: true,
    reward,
  };
}
