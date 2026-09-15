import test from 'node:test';
import assert from 'node:assert/strict';
import { completeMission } from '../../src/server/domain/progression/complete-mission.mjs';
import { rewardFromMissionDefinition } from '../../src/server/domain/economy/reward-policy.mjs';

function fixture(overrides = {}) {
  const grants = [];
  let claimed = false;
  const deps = {
    missions: { getById: async () => ({ id: 'w1-m1', enabled: true, rewardXp: 150, rewardStars: 1 }) },
    validator: { validate: async () => ({ passed: true }) },
    progress: { claimFirstCompletion: async () => { if (claimed) return false; claimed = true; return true; } },
    economy: { grantMissionReward: async (grant) => { grants.push(grant); } },
    clock: { now: () => new Date('2026-09-15T10:00:00Z') },
    ...overrides,
  };
  return { deps, grants };
}

const request = { userId: 'player-1', missionId: 'w1-m1', attemptId: 'attempt-1', evidence: { answer: 'e4' } };

test('reward policy preserves v191 ETS ratio', () => {
  assert.deepEqual(rewardFromMissionDefinition({ rewardXp: 150, rewardStars: 1 }), { xp: 150, ets: 8, stars: 1 });
  assert.deepEqual(rewardFromMissionDefinition({ rewardXp: 0 }), { xp: 0, ets: 0, stars: 0 });
});

test('first valid completion receives the server-defined reward', async () => {
  const { deps, grants } = fixture();
  const result = await completeMission(request, deps);
  assert.equal(result.code, 'FIRST_COMPLETION_REWARDED');
  assert.deepEqual(result.reward, { xp: 150, ets: 8, stars: 1 });
  assert.equal(grants.length, 1);
});

test('replay never farms the principal reward', async () => {
  const { deps, grants } = fixture();
  await completeMission(request, deps);
  const replay = await completeMission({ ...request, attemptId: 'attempt-2' }, deps);
  assert.equal(replay.code, 'REPLAY_COMPLETED');
  assert.deepEqual(replay.reward, { xp: 0, ets: 0, stars: 0 });
  assert.equal(grants.length, 1);
});

test('failed validation never grants currency', async () => {
  const { deps, grants } = fixture({ validator: { validate: async () => ({ passed: false, feedback: 'retry' }) } });
  const result = await completeMission(request, deps);
  assert.equal(result.code, 'MISSION_NOT_PASSED');
  assert.equal(grants.length, 0);
});

test('disabled or unknown mission cannot grant a reward', async () => {
  const { deps, grants } = fixture({ missions: { getById: async () => null } });
  const result = await completeMission(request, deps);
  assert.equal(result.code, 'MISSION_NOT_AVAILABLE');
  assert.equal(grants.length, 0);
});

test('client-supplied fake reward fields are ignored', async () => {
  const { deps } = fixture();
  const result = await completeMission({ ...request, xp: 999999, ets: 999999, stars: 999999 }, deps);
  assert.deepEqual(result.reward, { xp: 150, ets: 8, stars: 1 });
});

test('identity fields are mandatory', async () => {
  const { deps } = fixture();
  await assert.rejects(() => completeMission({ missionId: 'w1-m1', attemptId: 'a' }, deps), /userId is required/);
});
