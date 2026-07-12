export type Suspect = {
  id: string;
  name: string;
  // Character portrait, shown only during examination. Placeholder path for now.
  imageUrl: string;
  // What the suspect claims they were doing (their alibi/claim).
  statement: string;
};

// Case creators pick how long the examination phase lasts.
export type ExamDurationSeconds = 20 | 30 | 45 | 60;

export type CaseResponse = {
  type: 'case';
  caseId: string;
  title: string;
  // The crime setup text shown before the investigation begins.
  scenario: string;
  suspects: Suspect[];
  clues: string[];
  examSeconds: ExamDurationSeconds;
};

export type AccuseRequest = {
  caseId: string;
  suspectId: string;
  cluesRevealed: number;
};

export type LeaderboardEntry = {
  rank: number;
  userId: string;
  username: string;
  total: number;
};

// The requesting player's own standing. `total`/`rank`/`percentile` are all
// null-safe: a player with no recorded score yet has total 0, rank null
// (not ranked), percentile null. `rank` is 1-indexed (1 = best). `percentile`
// is only meaningful outside the top 10 — see LeaderboardResult.
export type LeaderboardMe = {
  userId: string;
  username: string;
  total: number;
  rank: number | null;
  percentile: number | null;
};

export type LeaderboardResult = {
  top: LeaderboardEntry[];
  // Null when the request has no logged-in user.
  me: LeaderboardMe | null;
};

export type AccuseResponse = {
  type: 'accuse';
  correct: boolean;
  culpritId: string;
  culpritName: string;
  score: number;
  // Only present on a wrong accusation — reveals the reasoning so the
  // player can see the case was fair.
  solvabilityNote?: string;
  leaderboard: LeaderboardResult;
};
