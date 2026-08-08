import { redis } from '@devvit/web/server';
import type { LeaderboardResult } from '../../shared/api';
import { CASES } from './cases';

const TOP_N = 10;
const LEADERBOARD_KEY = 'leaderboard:total';
const USERNAMES_KEY = 'usernames';
const bestScoreKey = (caseId: string) => `bestScore:${caseId}`;

// Case ids from every case set this app has ever shipped (not just the
// current CASES). Kept so a reset can wipe per-case best-score hashes left
// behind by a since-replaced case file, not just the currently active ids.
const RETIRED_CASE_IDS = [
  'case-1-greenhouse',
  'case-2-poisoned-cake',
  'case-3-smudged-glass',
  'case-4-jammed-vault',
  'case-5-erased-footage',
  'case-6-harbor-smoke',
  'case-7-lifted-wallet',
  'case-8-insurance-swap',
  'case-9-missing-page',
  'case-10-clock-tower',
  'case-11-dropped-fan',
  'case-12-inside-job',
];

// Records `score` as the player's result for `caseId`, but only if it beats
// their previous best for that case — replaying a solved case never adds to
// the cumulative total twice. The leaderboard sorted set is bumped by the
// delta so its score always equals the sum of each case's best score.
export async function recordScore(
  caseId: string,
  userId: string,
  username: string,
  score: number
): Promise<void> {
  if (score <= 0) return;

  const key = bestScoreKey(caseId);
  const prevRaw = await redis.hGet(key, userId);
  const prevBest = prevRaw ? Number(prevRaw) : 0;
  if (score <= prevBest) return;

  await redis.hSet(key, { [userId]: String(score) });
  await redis.hSet(USERNAMES_KEY, { [userId]: username });
  await redis.zIncrBy(LEADERBOARD_KEY, userId, score - prevBest);
}

// Wipes the leaderboard total, the username lookup, and every case's
// best-score hash (current and retired case ids), so old scores never
// resurface and every player starts back at 0.
export async function resetLeaderboard(): Promise<void> {
  const caseIds = new Set([...RETIRED_CASE_IDS, ...CASES.map((kase) => kase.id)]);
  await redis.del(LEADERBOARD_KEY, USERNAMES_KEY, ...[...caseIds].map(bestScoreKey));
}

export async function getLeaderboard(
  userId: string | undefined,
  username: string | undefined
): Promise<LeaderboardResult> {
  const totalPlayers = await redis.zCard(LEADERBOARD_KEY);

  const topRows = totalPlayers
    ? await redis.zRange(LEADERBOARD_KEY, 0, TOP_N - 1, { by: 'rank', reverse: true })
    : [];
  const topUsernames = topRows.length
    ? await redis.hMGet(USERNAMES_KEY, topRows.map((row) => row.member))
    : [];

  const top = topRows.map((row, i) => ({
    rank: i + 1,
    userId: row.member,
    username: topUsernames[i] ?? 'Anonymous',
    total: row.score,
  }));

  if (!userId) return { top, me: null };

  const myTotal = await redis.zScore(LEADERBOARD_KEY, userId);
  if (myTotal === undefined) {
    return {
      top,
      me: { userId, username: username ?? 'Anonymous', total: 0, rank: null, percentile: null },
    };
  }

  // zRank is 0-indexed ascending (lowest score = 0); flip it to a 1-indexed
  // rank from the top.
  const ascRank = (await redis.zRank(LEADERBOARD_KEY, userId))!;
  const rank = totalPlayers - ascRank;
  const percentile = rank <= TOP_N ? null : Math.max(1, Math.ceil((rank / totalPlayers) * 100));

  return {
    top,
    me: { userId, username: username ?? 'Anonymous', total: myTotal, rank, percentile },
  };
}
