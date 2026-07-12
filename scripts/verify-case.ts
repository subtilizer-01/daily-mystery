// Statement-based cases can't be verified by a boolean trait-matcher — the
// deduction hinges on whether a clue *contradicts or matches* a suspect's
// natural-language statement, which is a judgment call, not a lookup. This
// script instead prints every case in the daily rotation, plus its
// solvabilityNote, for a human to eyeball-review before shipping. Run with:
//   npm run verify:case
import { CASES } from '../src/server/core/case';

let ok = true;

for (const kase of CASES) {
  console.log(`Case: "${kase.title}" (${kase.id}) — ${kase.suspects.length} suspects, ${kase.clues.length} clues, culprit = ${kase.culpritId}\n`);

  console.log('Scenario:');
  console.log(`  ${kase.scenario}\n`);

  console.log('Suspect statements:');
  for (const suspect of kase.suspects) {
    console.log(
      `  ${suspect.name} (${suspect.id})${suspect.id === kase.culpritId ? ' [CULPRIT]' : ''}: "${suspect.statement}"`
    );
  }
  console.log();

  console.log('Clues (revealed in order):');
  kase.clues.forEach((clue, i) => console.log(`  ${i + 1}. ${clue}`));
  console.log();

  if (!kase.solvabilityNote.trim()) {
    console.error(`FAIL: "${kase.title}" has an empty solvabilityNote — explain why exactly one suspect fits before shipping this case.`);
    ok = false;
  } else {
    console.log('Solvability note (verify this reasoning names exactly one culprit):');
    console.log(`  ${kase.solvabilityNote}\n`);
  }

  console.log('-'.repeat(72) + '\n');
}

console.log(`Checked ${CASES.length} case(s). This is not a mechanical proof — read each note against its statements and clues and confirm by hand that only the culprit fits.`);

process.exit(ok ? 0 : 1);
