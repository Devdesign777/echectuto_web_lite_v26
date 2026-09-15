import { ZERO_REWARD } from '../economy/reward-policy.mjs';

function requireText(value, field) {
  if (typeof value !== 'string' || value.trim() === '') throw new TypeError(`${field} is required`);
  return value.trim();
}

/**
 * Authoritative mission-completion use case.
 * Chess/evidence validation happens first; one database transaction then finalizes the attempt,
 * claims first completion, writes ledger entries and increments balances atomically.
 */
export async function completeMission(request, deps) {
  const userId = requireText(request?.userId, 'userId');
  const missionId = requireText(request?.missionId, 'missionId');
  const attemptId = requireText(request?.attemptId, 'attemptId');

  const mission = await deps.missions.getById(missionId);
  if (!mission || mission.enabled === false) return { ok: false, code: 'MISSION_NOT_AVAILABLE' };

  const validation = await deps.validator.validate({ userId, mission, attemptId, evidence: request.evidence ?? null });
  if (!validation?.passed) {
    return { ok: false, code: 'MISSION_NOT_PASSED', feedback: validation?.feedback ?? null };
  }

  const finalized = await deps.progress.finalizeValidatedAttempt({
    userId,
    missionId,
    attemptId,
    validationFeedback: validation?.feedback ?? null,
  });

  if (!finalized.firstCompletion) {
    return { ok: true, code: 'REPLAY_COMPLETED', firstCompletion: false, reward: ZERO_REWARD, balance: finalized.balance };
  }

  return {
    ok: true,
    code: 'FIRST_COMPLETION_REWARDED',
    firstCompletion: true,
    reward: finalized.reward,
    balance: finalized.balance,
  };
}
