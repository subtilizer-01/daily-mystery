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
  // culprit. Not sent to the client on a correct guess — used to
  // eyeball-verify a case is fair before shipping it (see
  // scripts/verify-case.ts), and shown to the player after a WRONG guess so
  // they can see the deduction was fair.
  solvabilityNote: string;
};

// Portrait art isn't ready yet — every suspect points at the same
// placeholder until real character images are supplied.
const PLACEHOLDER_IMAGE = '/suspects/placeholder.png';

const VANISHING_DIAMOND: Case = {
  id: 'case-vanishing-diamond',
  title: 'The Vanishing Diamond',
  scenario:
    'A priceless diamond vanished from the Grand City Museum during last ' +
    "night's gala. Security cameras went dark for exactly ten minutes. " +
    'Five guests remained on the premises when the alarm sounded — and ' +
    'one of them is lying.',
  suspects: [
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
      statement:
        'I was chatting with the caterers by the kitchen the whole time.',
    },
  ],
  clues: [
    'The door facing the back alley where delivery trucks pull in never rearmed after the blackout began, though every other exterior door on that side of the building still tripped its sensor.',
    'That same alley door had been propped open well before the cameras cut out, meaning whoever used it had already been posted there — not merely passing through in the dark.',
    'The two rooms nearest the guest cloakroom and the camera-monitoring booth both stayed locked from the inside all night; reaching the alley door from either would have meant crossing the staircase landing, whose motion log shows nobody crossed it.',
  ],
  culpritId: 's3',
  examSeconds: 30,
  solvabilityNote:
    'Clues 1-2 describe the loading dock obliquely (the "door facing the ' +
    'back alley") without ever naming it, establishing that whoever ' +
    'used it was already stationed there before the blackout began, not ' +
    "just passing through. Sam Patel's statement (\"stepped outside for " +
    'some air near the loading dock") is the only alibi that maps onto ' +
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

const MISSING_MANUSCRIPT: Case = {
  id: 'case-missing-manuscript',
  title: 'The Missing Manuscript',
  scenario:
    "The university library's prize manuscript disappeared during a " +
    "scheduled fire drill. The reading room's cameras were switched off " +
    'for the drill\'s ten-minute duration, per policy — and whoever slipped ' +
    'back in after the alarm knew that policy well.',
  suspects: [
    {
      id: 'm1',
      name: 'Priya Nandan',
      imageUrl: PLACEHOLDER_IMAGE,
      statement:
        'I was three floors down, propping the stairwell doors open for the evacuation.',
    },
    {
      id: 'm2',
      name: 'Owen Blake',
      imageUrl: PLACEHOLDER_IMAGE,
      statement: 'I stood by the main desk checking names off the sign-out sheet.',
    },
    {
      id: 'm3',
      name: 'Lena Voss',
      imageUrl: PLACEHOLDER_IMAGE,
      statement: 'I ducked into the periodicals nook to grab my water bottle before heading down.',
    },
    {
      id: 'm4',
      name: 'Marcus Webb',
      imageUrl: PLACEHOLDER_IMAGE,
      statement: 'I was out on the quad with everyone else until the all-clear.',
    },
  ],
  clues: [
    'The turnstile guarding the manuscript wing logged one badge swiping back in less than a minute after the alarm sounded — and that badge never swiped out again until the drill ended.',
    'That badge belongs to whoever was already tucked into a small alcove behind the card catalog — the only spot in that wing not covered by any of the drill\'s designated meeting points.',
    "Two separate staff logs place a volunteer and a name-checker in full view of each other for the drill's entire ten minutes, with no gap between them.",
  ],
  culpritId: 'm3',
  examSeconds: 30,
  solvabilityNote:
    'Clues 1-2 establish that the manuscript wing was breached by a badge ' +
    'that swiped back in almost immediately and then lingered in a small ' +
    'alcove for the rest of the drill. Lena Voss\'s statement ("ducked into ' +
    'the periodicals nook to grab my water bottle") is the only alibi that ' +
    'maps onto that alcove — "nook" and "alcove" are different words for ' +
    'the same spot, so the player must infer the match rather than read it ' +
    "off. Clue 3 clears Priya Nandan (propping stairwell doors, described " +
    'as "a volunteer") and Owen Blake (checking the sign-out sheet, ' +
    'described as "a name-checker") by placing them in each other\'s sight ' +
    'the whole time — again via role description, not shared vocabulary. ' +
    'Marcus Webb (out on the quad) is never placed anywhere near the ' +
    'manuscript wing by any clue. Only Lena matches all three clues.',
};

const CRACKED_VASE: Case = {
  id: 'case-cracked-vase',
  title: 'The Cracked Vase',
  scenario:
    'A Ming-dynasty vase was swapped for a convincing fake during a ' +
    'gallery fundraiser, in the few minutes the room dimmed for a toast.',
  suspects: [
    {
      id: 'v1',
      name: 'Ivy Okafor',
      imageUrl: PLACEHOLDER_IMAGE,
      statement: 'I was topping off glasses at the bar the whole toast.',
    },
    {
      id: 'v2',
      name: 'Theo Banks',
      imageUrl: PLACEHOLDER_IMAGE,
      statement: 'I was helping the quartet retune near the stage.',
    },
    {
      id: 'v3',
      name: 'Renee Castillo',
      imageUrl: PLACEHOLDER_IMAGE,
      statement: 'I stepped onto the balcony for photos of the skyline.',
    },
    {
      id: 'v4',
      name: 'Devon Marsh',
      imageUrl: PLACEHOLDER_IMAGE,
      statement: 'I slipped into the coat room for my jacket right when the lights dipped.',
    },
  ],
  clues: [
    "The pedestal's motion sensor caught someone crouched beside the display for several seconds right when the room dimmed — no badge opened that case, meaning the latch had already been popped ahead of time.",
    "Whoever crouched there had ducked through the one door that swings wide enough to hide it — the little side room off the entrance hall reserved for guests' outerwear.",
    'Three separate staff logs each place a different guest in continuous view the entire time the room was dim: one behind the drink station, one with the musicians, and one stepping outside for pictures and back — none of them anywhere near that side room.',
  ],
  culpritId: 'v4',
  examSeconds: 30,
  solvabilityNote:
    'Clues 1-2 place the thief crouched in the room reserved for guests\' ' +
    'outerwear, already there before the room dimmed. Devon Marsh\'s ' +
    'statement ("slipped into the coat room for my jacket") is the only ' +
    'alibi that maps onto that room — "coat room"/"outerwear" are ' +
    'different words for the same place, so the match has to be inferred. ' +
    'Clue 3 clears Ivy Okafor ("behind the drink station" = the bar), Theo ' +
    'Banks ("with the musicians" = the quartet/stage), and Renee Castillo ' +
    '("stepping outside for pictures" = the balcony) all at once, each via ' +
    'a paraphrase of their own claimed location, not shared vocabulary. ' +
    'Only Devon matches all three clues.',
};

// Rotation order. Add new cases here; getTodayCase() indexes into this by
// day, so appending is safe (it only changes which future days land on
// which existing cases, never past assignments other than the wraparound
// point).
export const CASES: Case[] = [VANISHING_DIAMOND, MISSING_MANUSCRIPT, CRACKED_VASE];

const MS_PER_DAY = 86_400_000;

// All players get the same case on the same UTC calendar day, rotating
// through CASES in order and wrapping around.
export function getTodayCase(date: Date = new Date()): Case {
  const dayIndex = Math.floor(date.getTime() / MS_PER_DAY);
  return CASES[dayIndex % CASES.length]!;
}

export function getCaseById(caseId: string): Case | undefined {
  return CASES.find((kase) => kase.id === caseId);
}

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
