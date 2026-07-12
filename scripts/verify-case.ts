// Statement-based cases can't be verified by a boolean trait-matcher — the
// deduction hinges on whether a clue *contradicts or matches* a suspect's
// natural-language statement, which is a judgment call, not a lookup. This
// script instead prints the case + its solvabilityNote for a human to
// eyeball-review before shipping. Run with:
//   npm run verify:case
import { CLUES, CULPRIT_ID, DAILY_CASE, SUSPECTS } from '../src/server/core/case';

console.log(`Case: "${DAILY_CASE.title}" — ${SUSPECTS.length} suspects, ${CLUES.length} clues, culprit = ${CULPRIT_ID}\n`);

console.log('Scenario:');
console.log(`  ${DAILY_CASE.scenario}\n`);

console.log('Suspect statements:');
for (const suspect of SUSPECTS) {
  console.log(
    `  ${suspect.name} (${suspect.id})${suspect.id === CULPRIT_ID ? ' [CULPRIT]' : ''}: "${suspect.statement}"`
  );
}
console.log();

console.log('Clues (revealed in order):');
CLUES.forEach((clue, i) => console.log(`  ${i + 1}. ${clue}`));
console.log();

if (!DAILY_CASE.solvabilityNote.trim()) {
  console.error('FAIL: solvabilityNote is empty — explain why exactly one suspect fits before shipping this case.');
  process.exit(1);
}

console.log('Solvability note (verify this reasoning names exactly one culprit):');
console.log(`  ${DAILY_CASE.solvabilityNote}\n`);

console.log('This is not a mechanical proof — read the note against the statements and clues above and confirm by hand that only the culprit fits.');
