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
  suspectId: string;
  cluesRevealed: number;
};

export type AccuseResponse = {
  type: 'accuse';
  correct: boolean;
  culpritId: string;
  culpritName: string;
  score: number;
};
