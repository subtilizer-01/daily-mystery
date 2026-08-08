// Statement-based cases can't be verified by a boolean trait-matcher — the
// deduction hinges on whether a clue *contradicts or matches* a suspect's
// natural-language statement, which is a judgment call, not a lookup. This
// script instead prints every case in the daily rotation, plus its
// solution, for a human to eyeball-review before shipping. It also runs a
// few mechanical sanity checks (duplicate ids, culpritId referencing a real
// suspect, non-empty solution) that don't need human judgment. Run with:
//   npm run verify:case
import { CASES } from '../src/server/core/cases';

let ok = true;

const seenCaseIds = new Set<string>();

for (const kase of CASES) {
  console.log(`Case: "${kase.title}" (${kase.id}) — ${kase.suspects.length} suspects, ${kase.clues.length} clues, culprit = ${kase.culpritId}\n`);

  if (seenCaseIds.has(kase.id)) {
    console.error(`FAIL: duplicate case id "${kase.id}".`);
    ok = false;
  }
  seenCaseIds.add(kase.id);

  console.log('Scenario:');
  console.log(`  ${kase.scenario}\n`);

  console.log('Suspect statements:');
  for (const suspect of kase.suspects) {
    console.log(
      `  ${suspect.name} (${suspect.id})${suspect.id === kase.culpritId ? ' [CULPRIT]' : ''}: "${suspect.statement}"`
    );
  }
  console.log();

  if (!kase.suspects.some((s) => s.id === kase.culpritId)) {
    console.error(`FAIL: "${kase.title}"'s culpritId "${kase.culpritId}" doesn't match any suspect id.`);
    ok = false;
  }

  console.log('Clues (revealed in order):');
  kase.clues.forEach((clue, i) => console.log(`  ${i + 1}. ${clue}`));
  console.log();

  if (!kase.solution.trim()) {
    console.error(`FAIL: "${kase.title}" has an empty solution — explain why exactly one suspect fits before shipping this case.`);
    ok = false;
  } else {
    console.log('Solution (verify this reasoning names exactly one culprit):');
    console.log(`  ${kase.solution}\n`);
  }

  console.log('-'.repeat(72) + '\n');
}

console.log(`Checked ${CASES.length} case(s). Mechanical checks (duplicate ids, culpritId validity, non-empty solution) passed automatically; the deduction itself is not a mechanical proof — read each solution against its statements and clues and confirm by hand that only the culprit fits.`);

process.exit(ok ? 0 : 1);
