import test from 'node:test';
import assert from 'node:assert/strict';
import { completeMission } from '../../src/server/domain/progression/complete-mission.mjs';
import { rewardFromMissionDefinition } from '../../src/server/domain/economy/reward-policy.mjs';

function fixture(overrides = {}) {
  let claimed = false;
  const calls = [];
  const deps = {
    missions: { getById: async () => ({ id: 'w1-m1', enabled: true, rewardXp: 150, rewardStars: 1 }) },
    validator: { validate: async () => ({ passed: true }) },
    progress: { finalizeValidatedAttempt: async (input) => {
      calls.push(input);
      if (claimed) return { firstCompletion: false, reward: { xp: 0, ets: 0, stars: 0 }, balance: { xp: 150, ets: 8, stars: 1 } };
      claimed = true;
      return { firstCompletion: true, reward: { xp: 150, ets: 8, stars: 1 }, balance: { xp: 150, ets: 8, stars: 1 } };
    } },
    ...overrides,
  };
  return { deps, calls };
}

const request = { userId: 'player-1', missionId: 'w1-m1', attemptId: 'attempt-1', evidence: { answer: 'e4' } };

test('reward policy preserves v191 ETS ratio', () => {
  assert.deepEqual(rewardFromMissionDefinition({ rewardXp: 150, rewardStars: 1 }), { xp: 150, ets: 8, stars: 1 });
});

test('first valid completion returns database-authoritative reward and balance', async () => {
  const { deps, calls } = fixture();
  const result = await completeMission(request, deps);
  assert.equal(result.code, 'FIRST_COMPLETION_REWARDED');
  assert.deepEqual(result.reward, { xp: 150, ets: 8, stars: 1 });
  assert.deepEqual(result.balance, { xp: 150, ets: 8, stars: 1 });
  assert.equal(calls.length, 1);
});

test('replay never farms the principal reward', async () => {
  const { deps } = fixture();
  await completeMission(request, deps);
  const replay = await completeMission({ ...request, attemptId: 'attempt-2' }, deps);
  assert.equal(replay.code, 'REPLAY_COMPLETED');
  assert.deepEqual(replay.reward, { xp: 0, ets: 0, stars: 0 });
});

test('failed validation never enters the database finalization transaction', async () => {
  const { deps, calls } = fixture({ validator: { validate: async () => ({ passed: false, feedback: 'retry' }) } });
  const result = await completeMission(request, deps);
  assert.equal(result.code, 'MISSION_NOT_PASSED');
  assert.equal(calls.length, 0);
});

test('disabled or unknown mission cannot finalize', async () => {
  const { deps, calls } = fixture({ missions: { getById: async () => null } });
  const result = await completeMission(request, deps);
  assert.equal(result.code, 'MISSION_NOT_AVAILABLE');
  assert.equal(calls.length, 0);
});

test('client-supplied fake reward fields are never forwarded to the transaction', async () => {
  const { deps, calls } = fixture();
  await completeMission({ ...request, xp: 999999, ets: 999999, stars: 999999 }, deps);
  assert.deepEqual(Object.keys(calls[0]).sort(), ['attemptId','missionId','userId','validationFeedback'].sort());
});

test('identity fields are mandatory', async () => {
  const { deps } = fixture();
  await assert.rejects(() => completeMission({ missionId: 'w1-m1', attemptId: 'a' }, deps), /userId is required/);
});
