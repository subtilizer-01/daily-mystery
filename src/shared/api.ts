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

// 'daily' is the built-in rotation; 'community' is player-authored, played
// for fun via shuffle and never scored on the leaderboard.
export type CaseSource = 'daily' | 'community';

export type CaseResponse = {
  type: 'case';
  caseId: string;
  source: CaseSource;
  // Set when source is 'community', and also when source is 'daily' but
  // today's pick is a promoted community case — the creator still gets
  // credit even though it's presented as the one shared daily case.
  creatorUsername?: string;
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

// One suspect slot in a player-authored case: a library character plus the
// alibi the creator writes for them.
export type CreateCaseSuspectInput = {
  libraryId: string;
  statement: string;
};

export type CreateCaseRequest = {
  title: string;
  scenario: string;
  // Always exactly 5, in display order.
  suspects: CreateCaseSuspectInput[];
  // Index into `suspects` marking the culprit.
  culpritIndex: number;
  // 2-4 clues, revealed in order.
  clues: string[];
  examSeconds: ExamDurationSeconds;
};

export type CreateCaseResponse = {
  type: 'create-case';
  caseId: string;
};

export type ReportCaseResponse = {
  type: 'report-case';
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
  // False for community cases: the score is still shown for fun, but never
  // recorded against the leaderboard total.
  scored: boolean;
  // The case's player-facing reveal — shown on the result screen whether
  // the accusation was right or wrong, so the deduction is always visible.
  solution: string;
  leaderboard: LeaderboardResult;
};
