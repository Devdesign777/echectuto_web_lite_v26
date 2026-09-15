import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeQueuedEvents, pendingAfterServerSequence, canSubmitAttempt, authoritativeSubmissionPayload } from '../../src/server/domain/attempts/attempt-sync.mjs';

test('offline events are ordered and exact retries are deduplicated', () => {
  const events = normalizeQueuedEvents([
    { sequence: 2, type: 'move', payload: { uci: 'e7e5' } },
    { sequence: 1, type: 'move', payload: { uci: 'e2e4' } },
    { sequence: 1, type: 'move', payload: { uci: 'e2e4' } },
  ]);
  assert.deepEqual(events.map(e => e.sequence), [1,2]);
});

test('conflicting retries for the same sequence are rejected', () => {
  assert.throws(() => normalizeQueuedEvents([
    { sequence: 1, type: 'move', payload: { uci: 'e2e4' } },
    { sequence: 1, type: 'move', payload: { uci: 'd2d4' } },
  ]), /conflicting/);
});

test('reconnect only resends events not acknowledged by server', () => {
  const pending = pendingAfterServerSequence([
    { sequence: 1, type: 'move', payload: { uci: 'e2e4' } },
    { sequence: 2, type: 'move', payload: { uci: 'e7e5' } },
    { sequence: 3, type: 'move', payload: { uci: 'g1f3' } },
  ], 2);
  assert.deepEqual(pending.map(e => e.sequence), [3]);
});

test('submission waits for network and event synchronization', () => {
  assert.equal(canSubmitAttempt({ online: false, pendingEventCount: 0, attemptStatus: 'started' }), false);
  assert.equal(canSubmitAttempt({ online: true, pendingEventCount: 1, attemptStatus: 'started' }), false);
  assert.equal(canSubmitAttempt({ online: true, pendingEventCount: 0, attemptStatus: 'started' }), true);
});

test('submission payload cannot carry client rewards', () => {
  const payload = authoritativeSubmissionPayload({ attemptId: 'a', submissionKey: 's', evidence: { passed: true }, xp: 999999 });
  assert.deepEqual(payload, { attemptId: 'a', submissionKey: 's', evidence: { passed: true } });
  assert.equal('xp' in payload, false);
});
