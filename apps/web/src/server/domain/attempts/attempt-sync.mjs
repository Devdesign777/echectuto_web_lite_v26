export function normalizeQueuedEvents(events) {
  if (!Array.isArray(events)) throw new TypeError('events must be an array');
  const bySequence = new Map();
  for (const event of events) {
    if (!Number.isInteger(event.sequence) || event.sequence <= 0) throw new Error('invalid sequence');
    if (!['move', 'answer', 'checkpoint'].includes(event.type)) throw new Error('invalid event type');
    if (!event.payload || typeof event.payload !== 'object' || Array.isArray(event.payload)) throw new Error('invalid payload');
    const previous = bySequence.get(event.sequence);
    const canonical = JSON.stringify({ type: event.type, payload: event.payload });
    if (previous && previous.canonical !== canonical) throw new Error('conflicting duplicate sequence');
    bySequence.set(event.sequence, { ...event, canonical });
  }
  return [...bySequence.values()].sort((a,b) => a.sequence-b.sequence).map(({canonical, ...event}) => event);
}

export function pendingAfterServerSequence(events, serverSequence) {
  if (!Number.isInteger(serverSequence) || serverSequence < 0) throw new Error('invalid server sequence');
  return normalizeQueuedEvents(events).filter((event) => event.sequence > serverSequence);
}

export function canSubmitAttempt({ online, pendingEventCount, attemptStatus }) {
  return online === true && pendingEventCount === 0 && ['started', 'submitted'].includes(attemptStatus);
}

export function authoritativeSubmissionPayload({ attemptId, submissionKey, evidence }) {
  if (!attemptId || !submissionKey) throw new Error('attemptId and submissionKey are required');
  return { attemptId, submissionKey, evidence: evidence ?? {} };
}
