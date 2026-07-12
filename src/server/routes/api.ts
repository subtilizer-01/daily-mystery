import { Hono } from 'hono';
import { DAILY_CASE, getScore } from '../core/case';
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
  return c.json<CaseResponse>({
    type: 'case',
    caseId: DAILY_CASE.id,
    title: DAILY_CASE.title,
    scenario: DAILY_CASE.scenario,
    suspects: DAILY_CASE.suspects,
    clues: DAILY_CASE.clues,
    examSeconds: DAILY_CASE.examSeconds,
  });
});

api.post('/accuse', async (c) => {
  const body = await c.req.json<AccuseRequest>();
  const { suspectId, cluesRevealed } = body;

  const accusedExists = DAILY_CASE.suspects.some((s) => s.id === suspectId);
  if (!suspectId || !accusedExists) {
    return c.json<ErrorResponse>(
      { status: 'error', message: 'A valid suspectId is required' },
      400
    );
  }

  const culprit = DAILY_CASE.suspects.find(
    (s) => s.id === DAILY_CASE.culpritId
  )!;
  const correct = suspectId === DAILY_CASE.culpritId;

  return c.json<AccuseResponse>({
    type: 'accuse',
    correct,
    culpritId: culprit.id,
    culpritName: culprit.name,
    score: correct ? getScore(cluesRevealed, DAILY_CASE.clues.length) : 0,
  });
});
