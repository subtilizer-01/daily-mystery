import type { ExamDurationSeconds, Suspect, TraitKey } from '../../shared/api';

export type Case = {
  id: string;
  title: string;
  suspects: Suspect[];
  clues: string[];
  culpritId: string;
  examSeconds: ExamDurationSeconds;
};

// A clue asserts one trait value about the culprit. `text` is what the
// player sees; `trait`/`value` are the ground truth used to verify the
// puzzle is actually solvable by deduction (see scripts/verify-case.ts).
// This is the single source of truth for clue content — DAILY_CASE.clues
// below is derived from it, so the displayed text can never drift from the
// trait it claims to describe.
export type Clue = {
  trait: TraitKey;
  value: boolean;
  text: string;
};

export const CULPRIT_ID = 's3';

export const SUSPECTS: Suspect[] = [
  {
    id: 's1',
    name: 'Alex Rivera',
    traits: {
      hasScar: false,
      wearsHat: true,
      wearsGlasses: true,
      hasRedEyes: false,
      holdsKnife: false,
    },
  },
  {
    id: 's2',
    name: 'Jordan Lee',
    traits: {
      hasScar: false,
      wearsHat: false,
      wearsGlasses: false,
      hasRedEyes: false,
      holdsKnife: true,
    },
  },
  {
    id: 's3',
    name: 'Sam Patel',
    traits: {
      hasScar: true,
      wearsHat: false,
      wearsGlasses: false,
      hasRedEyes: true,
      holdsKnife: true,
    },
  },
  {
    id: 's4',
    name: 'Taylor Chen',
    traits: {
      hasScar: true,
      wearsHat: true,
      wearsGlasses: false,
      hasRedEyes: true,
      holdsKnife: false,
    },
  },
  {
    id: 's5',
    name: 'Morgan Cruz',
    traits: {
      hasScar: true,
      wearsHat: false,
      wearsGlasses: true,
      hasRedEyes: false,
      holdsKnife: false,
    },
  },
];

export const CLUES: Clue[] = [
  { trait: 'hasScar', value: true, text: 'The culprit has a scar.' },
  {
    trait: 'wearsGlasses',
    value: false,
    text: 'The culprit was NOT wearing glasses.',
  },
  { trait: 'hasRedEyes', value: true, text: 'The culprit has red eyes.' },
  {
    trait: 'holdsKnife',
    value: true,
    text: 'The culprit was holding a knife.',
  },
];

// Hardcoded sample case for testing the core game loop.
// TODO: replace with a real daily rotation once Redis/storage is wired up.
export const DAILY_CASE: Case = {
  id: 'sample-case-1',
  title: 'The Vanishing Diamond',
  suspects: SUSPECTS,
  clues: CLUES.map((clue) => clue.text),
  culpritId: CULPRIT_ID,
  // Case-creator-chosen study time before clues start (20/30/45/60s).
  examSeconds: 30,
};

// Score by number of clues revealed before the accusation. Clue 1 is always
// revealed automatically, so cluesRevealed is always >= 1. Fewer clues used
// before a correct accusation = higher score; a wrong accusation scores 0.
const SCORE_BY_CLUES_REVEALED: Record<number, number> = {
  1: 100,
  2: 80,
  3: 60,
  4: 40,
};

export function getScore(cluesRevealed: number): number {
  const clamped = Math.min(Math.max(cluesRevealed, 1), 4);
  return SCORE_BY_CLUES_REVEALED[clamped]!;
}
