import { redis } from '@devvit/web/server';
import { findLibraryCharacter } from '../../shared/suspectLibrary';
import type { CreateCaseRequest, ExamDurationSeconds } from '../../shared/api';
import type { CaseSuspect } from './cases';

export type CommunityCase = {
  id: string;
  title: string;
  scenario: string;
  suspects: CaseSuspect[];
  clues: string[];
  culpritId: string;
  examSeconds: ExamDurationSeconds;
  solution: string;
  creatorUserId: string;
  creatorUsername: string;
  createdAt: number;
};

// All community cases still in rotation (shuffle pool), scored by createdAt.
// A case leaves this index the moment it's reported — see reportCommunityCase.
const INDEX_KEY = 'communityCases:index';
// Subset of INDEX_KEY that has earned a spot in the daily pool alongside the
// curated CASES — see DAILY_ELIGIBILITY_MIN_PLAYS/_SOLVE_RATE below.
const ELIGIBLE_KEY = 'communityCases:eligible';
// Cases currently hidden pending moderator review, scored by report time.
const REPORTED_KEY = 'communityCases:reported';

const caseKey = (id: string) => `communityCase:${id}`;
// Hash of {plays, solves, reportCount} counters for one case, incremented
// atomically (hIncrBy) so concurrent plays can't race each other.
const statsKey = (id: string) => `communityCaseStats:${id}`;
// Hash of userId -> '1', used with hSetNX so a single player replaying (or
// re-reporting) the same case only ever counts once toward its stats.
const playersKey = (id: string) => `communityCasePlayers:${id}`;
const reportersKey = (id: string) => `communityCaseReporters:${id}`;

// A community case becomes eligible for the daily rotation once it's been
// played by enough distinct people, and enough of them actually solved it
// (a near-0% solve rate usually means a broken/ambiguous case — contradictory
// clues, a culprit the clues don't support, etc.). Both are deliberately low
// bars ("basic" quality gate, not a curation panel) — raise them here if the
// daily pool needs to be stricter.
export const DAILY_ELIGIBILITY_MIN_PLAYS = 10;
export const DAILY_ELIGIBILITY_MIN_SOLVE_RATE = 0.2;

const TITLE_MAX = 80;
const SCENARIO_MAX = 500;
const STATEMENT_MAX = 200;
const CLUE_MAX = 200;
const SUSPECT_COUNT = 5;
const CLUES_MIN = 2;
const CLUES_MAX = 4;
const EXAM_DURATIONS: ExamDurationSeconds[] = [20, 30, 45, 60];

export class CreateCaseValidationError extends Error {}

function validate(input: CreateCaseRequest): void {
  const title = input.title?.trim();
  if (!title || title.length > TITLE_MAX) {
    throw new CreateCaseValidationError(`Title must be 1-${TITLE_MAX} characters.`);
  }

  const scenario = input.scenario?.trim();
  if (!scenario || scenario.length > SCENARIO_MAX) {
    throw new CreateCaseValidationError(`Scenario must be 1-${SCENARIO_MAX} characters.`);
  }

  if (!Array.isArray(input.suspects) || input.suspects.length !== SUSPECT_COUNT) {
    throw new CreateCaseValidationError(`Pick exactly ${SUSPECT_COUNT} suspects.`);
  }
  for (const suspect of input.suspects) {
    if (!findLibraryCharacter(suspect.libraryId)) {
      throw new CreateCaseValidationError('Unknown suspect selected.');
    }
    const statement = suspect.statement?.trim();
    if (!statement || statement.length > STATEMENT_MAX) {
      throw new CreateCaseValidationError(`Each statement must be 1-${STATEMENT_MAX} characters.`);
    }
  }
  if (new Set(input.suspects.map((s) => s.libraryId)).size !== SUSPECT_COUNT) {
    throw new CreateCaseValidationError('Suspects must be 5 different characters.');
  }

  if (
    !Number.isInteger(input.culpritIndex) ||
    input.culpritIndex < 0 ||
    input.culpritIndex >= SUSPECT_COUNT
  ) {
    throw new CreateCaseValidationError('Pick which suspect is the culprit.');
  }

  if (!Array.isArray(input.clues) || input.clues.length < CLUES_MIN || input.clues.length > CLUES_MAX) {
    throw new CreateCaseValidationError(`Add ${CLUES_MIN}-${CLUES_MAX} clues.`);
  }
  for (const clue of input.clues) {
    const trimmed = clue?.trim();
    if (!trimmed || trimmed.length > CLUE_MAX) {
      throw new CreateCaseValidationError(`Each clue must be 1-${CLUE_MAX} characters.`);
    }
  }

  if (!EXAM_DURATIONS.includes(input.examSeconds)) {
    throw new CreateCaseValidationError('Invalid exam duration.');
  }
}

// Validates and persists a player-authored case. Throws
// CreateCaseValidationError (safe to surface to the client) on bad input.
export async function createCommunityCase(
  input: CreateCaseRequest,
  creatorUserId: string,
  creatorUsername: string
): Promise<string> {
  validate(input);

  const suspects: CaseSuspect[] = input.suspects.map((s, i) => {
    const character = findLibraryCharacter(s.libraryId)!;
    return {
      id: `s${i + 1}`,
      name: character.name,
      imageUrl: character.imageUrl,
      statement: s.statement.trim(),
    };
  });
  const culprit = suspects[input.culpritIndex]!;

  const id = `community-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const record: CommunityCase = {
    id,
    title: input.title.trim(),
    scenario: input.scenario.trim(),
    suspects,
    clues: input.clues.map((c) => c.trim()),
    culpritId: culprit.id,
    examSeconds: input.examSeconds,
    solution: `${culprit.name} is the culprit. Their story was: "${culprit.statement}" — but the clues point straight at them.`,
    creatorUserId,
    creatorUsername,
    createdAt: Date.now(),
  };

  await redis.set(caseKey(id), JSON.stringify(record));
  await redis.zAdd(INDEX_KEY, { member: id, score: record.createdAt });

  // TEMP VERIFICATION LOGGING — read the record back from Redis in a
  // separate call, proving persistence rather than an in-memory artifact.
  // Remove once verification is done.
  const readBack = await redis.get(caseKey(id));
  console.log(`[VERIFY] community case written to Redis key "${caseKey(id)}":`, readBack);
  console.log(`[VERIFY] index size (zCard "${INDEX_KEY}"):`, await redis.zCard(INDEX_KEY));

  return id;
}

export async function getCommunityCaseById(id: string): Promise<CommunityCase | undefined> {
  const raw = await redis.get(caseKey(id));
  console.log(`[VERIFY] read community case "${id}" from Redis:`, raw ? 'FOUND' : 'NOT FOUND', raw);
  return raw ? (JSON.parse(raw) as CommunityCase) : undefined;
}

// Picks a random community case, preferring ones not in `excludeIds` (the
// player's already-seen set this session); loops back over the full pool
// once they've seen everything. Returns undefined if none exist yet.
export async function getRandomCommunityCase(
  excludeIds: string[]
): Promise<CommunityCase | undefined> {
  const all = await redis.zRange(INDEX_KEY, 0, -1);
  if (!all.length) return undefined;

  const excludeSet = new Set(excludeIds);
  const pool = all.filter((row) => !excludeSet.has(row.member));
  const candidates = pool.length ? pool : all;
  const pick = candidates[Math.floor(Math.random() * candidates.length)]!;
  return getCommunityCaseById(pick.member);
}

// Every case currently eligible for the daily rotation (see
// DAILY_ELIGIBILITY_MIN_PLAYS/_SOLVE_RATE), ordered oldest-first — combined
// with the curated CASES by getTodayCase() in core/case.ts.
export async function getEligibleCommunityCases(): Promise<CommunityCase[]> {
  const rows = await redis.zRange(ELIGIBLE_KEY, 0, -1);
  if (!rows.length) return [];
  const cases = await Promise.all(rows.map((row) => getCommunityCaseById(row.member)));
  return cases.filter((c): c is CommunityCase => !!c);
}

async function isCaseReported(id: string): Promise<boolean> {
  return (await redis.zScore(REPORTED_KEY, id)) !== undefined;
}

// Re-checks one case's play/solve stats against the eligibility bar and
// adds/removes it from the daily pool accordingly. A reported case is never
// eligible, regardless of stats, until a moderator restores it.
async function refreshEligibility(id: string): Promise<void> {
  if (await isCaseReported(id)) {
    await redis.zRem(ELIGIBLE_KEY, [id]);
    return;
  }

  const stats = await redis.hGetAll(statsKey(id));
  const plays = Number(stats.plays ?? 0);
  const solves = Number(stats.solves ?? 0);
  const qualifies =
    plays >= DAILY_ELIGIBILITY_MIN_PLAYS && solves / plays >= DAILY_ELIGIBILITY_MIN_SOLVE_RATE;

  if (!qualifies) {
    await redis.zRem(ELIGIBLE_KEY, [id]);
    return;
  }

  const kase = await getCommunityCaseById(id);
  if (!kase) return;
  await redis.zAdd(ELIGIBLE_KEY, { member: id, score: kase.createdAt });
}

// Records one player's attempt at a community case, then re-checks whether
// it has crossed the daily-rotation quality bar. Each player only ever
// counts once per case (first attempt), so replaying "Play again" or
// spamming accusations can't inflate a case's stats. Anonymous players
// (no userId) aren't tracked — there's nothing to dedupe them against.
export async function recordCommunityCasePlay(
  id: string,
  userId: string | undefined,
  correct: boolean
): Promise<void> {
  if (!userId) return;
  const isFirstPlay = await redis.hSetNX(playersKey(id), userId, '1');
  if (!isFirstPlay) return;

  await redis.hIncrBy(statsKey(id), 'plays', 1);
  if (correct) await redis.hIncrBy(statsKey(id), 'solves', 1);
  await refreshEligibility(id);
}

// Flags a case as reported and immediately pulls it from both the shuffle
// pool (INDEX_KEY) and the daily pool (ELIGIBLE_KEY) pending moderator
// review — one report is enough to hide it, since the content itself is
// untouched and a moderator can restore it if the report doesn't hold up.
// Each reporter only counts once per case. Returns false if the case
// doesn't exist.
export async function reportCommunityCase(id: string, reporterUserId: string): Promise<boolean> {
  const kase = await getCommunityCaseById(id);
  if (!kase) return false;

  const isNewReporter = await redis.hSetNX(reportersKey(id), reporterUserId, '1');
  if (!isNewReporter) return true;

  await redis.hIncrBy(statsKey(id), 'reportCount', 1);
  await redis.zAdd(REPORTED_KEY, { member: id, score: Date.now() });
  await redis.zRem(INDEX_KEY, [id]);
  await redis.zRem(ELIGIBLE_KEY, [id]);
  return true;
}

export type ReportedCommunityCase = CommunityCase & { reportCount: number };

// The moderator review queue: every case currently hidden pending review,
// most-recently-reported first, with its report count for context.
export async function getReportedCases(): Promise<ReportedCommunityCase[]> {
  const rows = await redis.zRange(REPORTED_KEY, 0, -1, { by: 'rank', reverse: true });
  if (!rows.length) return [];

  const cases = await Promise.all(
    rows.map(async (row) => {
      const kase = await getCommunityCaseById(row.member);
      if (!kase) return undefined;
      const stats = await redis.hGetAll(statsKey(row.member));
      return { ...kase, reportCount: Number(stats.reportCount ?? 1) };
    })
  );
  return cases.filter((c): c is ReportedCommunityCase => !!c);
}

// Moderator action: dismisses the report(s) against a case and returns it to
// the shuffle pool. Its daily-rotation eligibility is re-checked from its
// existing stats (dismissing a report doesn't reset play/solve counters).
export async function restoreCommunityCase(id: string): Promise<void> {
  const kase = await getCommunityCaseById(id);
  if (!kase) return;

  await redis.zRem(REPORTED_KEY, [id]);
  const reporterIds = Object.keys(await redis.hGetAll(reportersKey(id)));
  if (reporterIds.length) await redis.hDel(reportersKey(id), reporterIds);
  await redis.zAdd(INDEX_KEY, { member: id, score: kase.createdAt });
  await refreshEligibility(id);
}

// Moderator action: permanently deletes a reported case and all of its
// tracked state. Cannot be undone.
export async function removeCommunityCase(id: string): Promise<void> {
  await redis.del(caseKey(id), statsKey(id), playersKey(id), reportersKey(id));
  await redis.zRem(INDEX_KEY, [id]);
  await redis.zRem(ELIGIBLE_KEY, [id]);
  await redis.zRem(REPORTED_KEY, [id]);
}
