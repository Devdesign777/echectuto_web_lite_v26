export type MissionCompletionEvidence = Readonly<Record<string, unknown>> | null;

export type CompleteMissionRequest = Readonly<{
  userId: string;
  missionId: string;
  attemptId: string;
  evidence?: MissionCompletionEvidence;
}>;

export type RewardGrant = Readonly<{
  xp: number;
  ets: number;
  stars: number;
}>;

// Intentionally absent from CompleteMissionRequest: xp, ets, stars, reward.
// Those values are resolved exclusively from the server-owned mission catalog.
