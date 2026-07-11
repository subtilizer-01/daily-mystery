export type TraitKey =
  | 'hasScar'
  | 'wearsHat'
  | 'wearsGlasses'
  | 'hasRedEyes'
  | 'holdsKnife';

export type SuspectTraits = Record<TraitKey, boolean>;

export type Suspect = {
  id: string;
  name: string;
  traits: SuspectTraits;
};

// Case creators pick how long the examination phase lasts.
export type ExamDurationSeconds = 20 | 30 | 45 | 60;

export type CaseResponse = {
  type: 'case';
  caseId: string;
  title: string;
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
