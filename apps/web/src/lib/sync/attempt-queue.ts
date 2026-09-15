export type OfflineAttemptEvent = {
  sequence: number;
  type: 'move' | 'answer' | 'checkpoint';
  payload: Record<string, unknown>;
};

export type OfflineAttemptQueue = {
  clientAttemptId: string;
  missionId: string;
  serverAttemptId?: string;
  serverSequence: number;
  events: OfflineAttemptEvent[];
  pendingSubmissionKey?: string;
  updatedAt: string;
};

const PREFIX = 'echectuto:attempt:v1:';

export function saveAttemptQueue(queue: OfflineAttemptQueue) {
  localStorage.setItem(`${PREFIX}${queue.clientAttemptId}`, JSON.stringify(queue));
}

export function loadAttemptQueue(clientAttemptId: string): OfflineAttemptQueue | null {
  const raw = localStorage.getItem(`${PREFIX}${clientAttemptId}`);
  if (!raw) return null;
  try { return JSON.parse(raw) as OfflineAttemptQueue; } catch { return null; }
}

export function removeAttemptQueue(clientAttemptId: string) {
  localStorage.removeItem(`${PREFIX}${clientAttemptId}`);
}
