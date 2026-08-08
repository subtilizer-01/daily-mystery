import { Hono } from 'hono';
import { context } from '@devvit/web/server';
import { getCaseById, getScore, getTodayCase } from '../core/case';
import { getLeaderboard, recordScore } from '../core/leaderboard';
import {
  CreateCaseValidationError,
  createCommunityCase,
  getCommunityCaseById,
  getRandomCommunityCase,
  recordCommunityCasePlay,
  reportCommunityCase,
} from '../core/communityCases';
import type {
  AccuseRequest,
  AccuseResponse,
  CaseResponse,
  CreateCaseRequest,
  CreateCaseResponse,
  ReportCaseResponse,
} from '../../shared/api';

type ErrorResponse = {
  status: 'error';
  message: string;
};

export const api = new Hono();

api.get('/case', async (c) => {
  // `?date=YYYY-MM-DD` lets you preview/force a specific day's case while
  // testing the rotation, e.g. GET /api/case?date=2026-07-20
  const dateParam = c.req.query('date');
  const date = dateParam && !Number.isNaN(Date.parse(dateParam)) ? new Date(dateParam) : new Date();
  const kase = await getTodayCase(date);
  return c.json<CaseResponse>({
    type: 'case',
    caseId: kase.id,
    source: 'daily',
    // Set when today's pick is a promoted community case, so the creator
    // gets credit even though it's presented as the shared daily case.
    creatorUsername: kase.creatorUsername,
    title: kase.title,
    scenario: kase.scenario,
    suspects: kase.suspects,
    clues: kase.clues,
    examSeconds: kase.examSeconds,
  });
});

api.get('/community-cases/random', async (c) => {
  // `?exclude=id1,id2` lets the client avoid repeats within a shuffle session.
  const excludeParam = c.req.query('exclude');
  const excludeIds = excludeParam ? excludeParam.split(',').filter(Boolean) : [];

  // TEMP VERIFICATION LOGGING — remove once verification is done.
  console.log(`[VERIFY] /community-cases/random requested by userId=${context.userId ?? 'anon'}`);

  const kase = await getRandomCommunityCase(excludeIds);
  if (!kase) {
    return c.json<ErrorResponse>(
      { status: 'error', message: 'No community cases yet — be the first to create one!' },
      404
    );
  }

  return c.json<CaseResponse>({
    type: 'case',
    caseId: kase.id,
    source: 'community',
    creatorUsername: kase.creatorUsername,
    title: kase.title,
    scenario: kase.scenario,
    suspects: kase.suspects,
    clues: kase.clues,
    examSeconds: kase.examSeconds,
  });
});

api.post('/community-cases', async (c) => {
  if (!context.userId) {
    return c.json<ErrorResponse>(
      { status: 'error', message: 'You must be signed in to create a case.' },
      401
    );
  }

  const body = await c.req.json<CreateCaseRequest>();
  // TEMP VERIFICATION LOGGING — remove once verification is done.
  console.log(`[VERIFY] /community-cases POST by userId=${context.userId}, username=${context.username}`);
  try {
    const caseId = await createCommunityCase(
      body,
      context.userId,
      context.username ?? 'Anonymous'
    );
    return c.json<CreateCaseResponse>({ type: 'create-case', caseId }, 200);
  } catch (error) {
    if (error instanceof CreateCaseValidationError) {
      return c.json<ErrorResponse>({ status: 'error', message: error.message }, 400);
    }
    console.error('Error creating community case:', error);
    return c.json<ErrorResponse>(
      { status: 'error', message: 'Failed to save your case.' },
      500
    );
  }
});

api.post('/accuse', async (c) => {
  const body = await c.req.json<AccuseRequest>();
  const { caseId, suspectId, cluesRevealed } = body;

  const dailyCase = getCaseById(caseId);
  const communityCase = dailyCase ? undefined : await getCommunityCaseById(caseId);
  const kase = dailyCase ?? communityCase;
  if (!kase) {
    return c.json<ErrorResponse>(
      { status: 'error', message: 'Unknown caseId' },
      400
    );
  }
  // Daily cases always count. Community cases count too, except for the
  // creator playing their own — otherwise they'd get free, trivial points
  // for "solving" a case they already know the answer to, and could inflate
  // their own case's stats toward daily-rotation eligibility.
  const isCreatorPlayingOwnCase = !!communityCase && communityCase.creatorUserId === context.userId;
  const scorable = !!dailyCase || (!!communityCase && !isCreatorPlayingOwnCase);

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

  if (scorable && correct && context.userId) {
    await recordScore(kase.id, context.userId, context.username ?? 'Anonymous', score);
  }

  // Track plays/solves toward this community case's daily-rotation
  // eligibility (see communityCases.ts). Applies whether it was reached via
  // shuffle or already promoted into the daily rotation.
  if (communityCase && !isCreatorPlayingOwnCase) {
    await recordCommunityCasePlay(communityCase.id, context.userId, correct);
  }

  const leaderboard = await getLeaderboard(context.userId, context.username);

  return c.json<AccuseResponse>({
    type: 'accuse',
    correct,
    culpritId: culprit.id,
    culpritName: culprit.name,
    score,
    scored: scorable,
    solution: kase.solution,
    leaderboard,
  });
});

api.post('/community-cases/:id/report', async (c) => {
  if (!context.userId) {
    return c.json<ErrorResponse>(
      { status: 'error', message: 'You must be signed in to report a case.' },
      401
    );
  }

  const id = c.req.param('id');
  const ok = await reportCommunityCase(id, context.userId);
  if (!ok) {
    return c.json<ErrorResponse>({ status: 'error', message: 'Unknown caseId' }, 404);
  }

  return c.json<ReportCaseResponse>({ type: 'report-case' }, 200);
});
