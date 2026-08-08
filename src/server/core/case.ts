import { CASES } from './cases';
import type { MysteryCase } from './cases';
import { getEligibleCommunityCases } from './communityCases';
import type { CommunityCase } from './communityCases';

export type { CaseSuspect, MysteryCase } from './cases';
export { CASES } from './cases';

// The case picked for a given day. Carries `creatorUsername` when the pick
// is a promoted community case, so the player can be shown credit for it
// even though it's presented as the (single, shared) daily case.
export type DailyCase = MysteryCase & { creatorUsername?: string };

const MS_PER_DAY = 86_400_000;

// xorshift-style string hash -> 32-bit seed.
function hashSeed(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// mulberry32: a small, deterministic PRNG. Same seed always produces the
// same sequence, which is exactly what a "same case for everyone, on this
// day only" rotation needs — no external randomness, no shared mutable state.
function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), a | 1);
    t = (t + Math.imul(t ^ (t >>> 7), t | 61)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seededShuffle<T>(items: readonly T[], seed: number): T[] {
  const arr = [...items];
  const rand = mulberry32(seed);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
  }
  return arr;
}

function toDailyCase(kase: MysteryCase | CommunityCase): DailyCase {
  return 'creatorUsername' in kase
    ? { ...kase, creatorUsername: kase.creatorUsername }
    : kase;
}

// All players get the same case on the same UTC calendar day. The pool is
// the 20 curated CASES plus every community case that's earned daily-rotation
// eligibility (see communityCases.ts) — so the game doesn't go stale once
// the curated set is exhausted.
//
// The pool is shuffled into a deterministic pseudo-random order, seeded per
// "cycle" (one full pass through the pool), so:
//   - every player computing this on the same day gets the same case
//     (no external randomness, no shared state to keep in sync)
//   - every case in the pool is played exactly once before any repeat
//     within a cycle — never the curated array's own order, which
//     deliberately alternates "obvious suspect is guilty" and "obvious
//     suspect is a red herring" and would otherwise be an exploitable
//     pattern
//
// If the pool's size changes between two days (a community case newly
// qualifies), the cycle containing that day reshuffles from scratch — this
// only affects cases not yet played in the *current* cycle, never rewrites
// a day that already happened.
export async function getTodayCase(date: Date = new Date()): Promise<DailyCase> {
  const eligible = await getEligibleCommunityCases();
  const pool: (MysteryCase | CommunityCase)[] = [...CASES, ...eligible];

  const dayIndex = Math.floor(date.getTime() / MS_PER_DAY);
  const cycleNumber = Math.floor(dayIndex / pool.length);
  const cycleIndex = dayIndex % pool.length;

  const seed = hashSeed(`chibi-mystery-daily:${pool.length}:${cycleNumber}`);
  const shuffled = seededShuffle(pool, seed);
  return toDailyCase(shuffled[cycleIndex]!);
}

export function getCaseById(caseId: string): MysteryCase | undefined {
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
