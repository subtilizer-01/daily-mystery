import { Hono } from 'hono';
import { context } from '@devvit/web/server';
import { getCaseById, getScore, getTodayCase } from '../core/case';
import { getLeaderboard, recordScore } from '../core/leaderboard';
import type {
  AccuseRequest,
  AccuseResponse,
  CaseResponse,
} from '../../shared/api';

type ErrorResponse = {
  status: 'error';
  message: string;
};

export const api = new Hono();

api.get('/case', (c) => {
  const kase = getTodayCase();
  return c.json<CaseResponse>({
    type: 'case',
    caseId: kase.id,
    title: kase.title,
    scenario: kase.scenario,
    suspects: kase.suspects,
    clues: kase.clues,
    examSeconds: kase.examSeconds,
  });
});

api.post('/accuse', async (c) => {
  const body = await c.req.json<AccuseRequest>();
  const { caseId, suspectId, cluesRevealed } = body;

  const kase = getCaseById(caseId);
  if (!kase) {
    return c.json<ErrorResponse>(
      { status: 'error', message: 'Unknown caseId' },
      400
    );
  }

  const accusedExists = kase.suspects.some((s) => s.id === suspectId);
  if (!suspectId || !accusedExists) {
    return c.json<ErrorResponse>(
      { status: 'error', message: 'A valid suspectId is required' },
      400
    );
  }

  const culprit = kase.suspects.find((s) => s.id === kase.culpritId)!;
  const correct = suspectId === kase.culpritId;
  const score = correct ? getScore(cluesRevealed, kase.clues.length) : 0;

  if (correct && context.userId) {
    await recordScore(kase.id, context.userId, context.username ?? 'Anonymous', score);
  }

  const leaderboard = await getLeaderboard(context.userId, context.username);

  return c.json<AccuseResponse>({
    type: 'accuse',
    correct,
    culpritId: culprit.id,
    culpritName: culprit.name,
    score,
    solvabilityNote: correct ? undefined : kase.solvabilityNote,
    leaderboard,
  });
});
