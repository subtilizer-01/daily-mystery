import type { ExamDurationSeconds, Suspect } from '../../shared/api';

export type Case = {
  id: string;
  title: string;
  scenario: string;
  suspects: Suspect[];
  // Evidence hints (vague but fair) revealed one at a time. 2-4 per case.
  clues: string[];
  culpritId: string;
  examSeconds: ExamDurationSeconds;
  // Dev-facing rationale for why the clues + statements pin exactly one
  // culprit. Not sent to the client — used to eyeball-verify a case is fair
  // and solvable before shipping it (see scripts/verify-case.ts).
  solvabilityNote: string;
};

export const CULPRIT_ID = 's3';

// Portrait art isn't ready yet — every suspect points at the same
// placeholder until real character images are supplied.
const PLACEHOLDER_IMAGE = '/suspects/placeholder.png';

export const SUSPECTS: Suspect[] = [
  {
    id: 's1',
    name: 'Alex Rivera',
    imageUrl: PLACEHOLDER_IMAGE,
    statement: 'I was signing autographs by the west entrance all night.',
  },
  {
    id: 's2',
    name: 'Jordan Lee',
    imageUrl: PLACEHOLDER_IMAGE,
    statement: 'I never left the coat check — ask anyone.',
  },
  {
    id: 's3',
    name: 'Sam Patel',
    imageUrl: PLACEHOLDER_IMAGE,
    statement: 'I stepped outside for some air near the loading dock.',
  },
  {
    id: 's4',
    name: 'Taylor Chen',
    imageUrl: PLACEHOLDER_IMAGE,
    statement: 'I was in the security office reviewing footage.',
  },
  {
    id: 's5',
    name: 'Morgan Cruz',
    imageUrl: PLACEHOLDER_IMAGE,
    statement: 'I was chatting with the caterers by the kitchen the whole time.',
  },
];

export const CLUES: string[] = [
  'The door facing the back alley where delivery trucks pull in never rearmed after the blackout began, though every other exterior door on that side of the building still tripped its sensor.',
  'That same alley door had been propped open well before the cameras cut out, meaning whoever used it had already been posted there — not merely passing through in the dark.',
  'The two rooms nearest the guest cloakroom and the camera-monitoring booth both stayed locked from the inside all night; reaching the alley door from either would have meant crossing the staircase landing, whose motion log shows nobody crossed it.',
];

// Hardcoded sample case for testing the core game loop.
// TODO: replace with a real daily rotation once Redis/storage is wired up.
export const DAILY_CASE: Case = {
  id: 'sample-case-1',
  title: 'The Vanishing Diamond',
  scenario:
    'A priceless diamond vanished from the Grand City Museum during last ' +
    "night's gala. Security cameras went dark for exactly ten minutes. " +
    'Five guests remained on the premises when the alarm sounded — and ' +
    'one of them is lying.',
  suspects: SUSPECTS,
  clues: CLUES,
  culpritId: CULPRIT_ID,
  // Case-creator-chosen study time before clues start (20/30/45/60s).
  examSeconds: 30,
  solvabilityNote:
    'Clues 1-2 describe the loading dock obliquely (the "door facing the ' +
    'back alley") without ever naming it, establishing that whoever ' +
    'used it was already stationed there before the blackout began, not ' +
    "just passing through. Sam Patel's statement (\"stepped outside for " +
    'some air near the loading dock\") is the only alibi that maps onto ' +
    "that spot for that exact window — the player has to infer that " +
    '"the door facing the back alley" is the loading dock; the words never ' +
    'match. Clue 3 clears Jordan Lee (coat check, described as the "guest ' +
    'cloakroom") and Taylor Chen (security office, described as the ' +
    '"camera-monitoring booth"): both rooms stayed locked, and reaching the ' +
    'alley door from either would have crossed the staircase landing, which ' +
    'recorded no crossing — again inferred by room description, not shared ' +
    'vocabulary. Alex Rivera (west entrance) and Morgan Cruz (kitchen) are ' +
    'never placed near the alley door by any clue, so neither can be ' +
    'inferred as the culprit. Only Sam matches — exactly one suspect ' +
    'satisfies every clue, and no clue text shares a location/object word ' +
    "with any suspect's statement.",
};

// Score by fraction of clues used before the accusation: revealing clue 1 is
// automatic, so cluesRevealed is always >= 1. A correct accusation using
// fewer clues (out of the case's total) scores higher; using every clue
// still scores a 40-point floor; a wrong accusation always scores 0.
export function getScore(cluesRevealed: number, totalClues: number): number {
  const clamped = Math.min(Math.max(cluesRevealed, 1), totalClues);
  if (totalClues <= 1) return 100;
  const step = 60 / (totalClues - 1);
  return Math.round(100 - (clamped - 1) * step);
}
