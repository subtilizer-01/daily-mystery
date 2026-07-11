// Verifies that the hardcoded case in src/server/core/case.ts is solvable by
// pure deduction from the suspects' visible traits: as each clue is revealed,
// only suspects matching every revealed clue remain possible, and exactly one
// suspect (the culprit) matches all clues by the end. Run with:
//   npm run verify:case
import { CLUES, CULPRIT_ID, SUSPECTS } from '../src/server/core/case';
import type { Suspect, TraitKey } from '../src/shared/api';

const matchesClue = (suspect: Suspect, clue: (typeof CLUES)[number]) =>
  suspect.traits[clue.trait] === clue.value;

const TRAIT_KEYS = Object.keys(SUSPECTS[0]!.traits) as TraitKey[];

let candidates = SUSPECTS;
let ok = true;

console.log(`Case: ${SUSPECTS.length} suspects, ${CLUES.length} clues, culprit = ${CULPRIT_ID}\n`);

console.log('Suspect traits:');
for (const suspect of SUSPECTS) {
  const traitList = TRAIT_KEYS.map(
    (key) => `${key}=${suspect.traits[key]}`
  ).join(', ');
  console.log(
    `  ${suspect.name} (${suspect.id})${suspect.id === CULPRIT_ID ? ' [CULPRIT]' : ''}: ${traitList}`
  );
}
console.log();

CLUES.forEach((clue, i) => {
  const before = candidates;
  const after = before.filter((s) => matchesClue(s, clue));
  const eliminated = before.filter((s) => !after.includes(s));

  console.log(`Clue ${i + 1}: "${clue.text}" (${clue.trait} = ${clue.value})`);
  console.log(
    `  Eliminated: ${eliminated.length === 0 ? 'none' : eliminated.map((s) => s.name).join(', ')}`
  );
  console.log(
    `  Remaining possible (${after.length}): ${after.map((s) => s.name).join(', ')}\n`
  );

  candidates = after;
});

if (candidates.length !== 1) {
  console.error(
    `FAIL: after all clues, ${candidates.length} suspects still match (expected exactly 1).`
  );
  ok = false;
} else if (candidates[0]!.id !== CULPRIT_ID) {
  console.error(
    `FAIL: the one remaining suspect (${candidates[0]!.name}) is not the culprit.`
  );
  ok = false;
} else {
  console.log(`PASS: only ${candidates[0]!.name} matches all ${CLUES.length} clues — solvable by deduction.`);
}

process.exit(ok ? 0 : 1);
