import { useCallback, useEffect, useState } from 'react';
import type {
  AccuseResponse,
  CaseResponse,
  CaseSource,
  ExamDurationSeconds,
  Suspect,
} from '../../shared/api';

type Phase = 'scenario' | 'examining' | 'clues';

type GameState = {
  loading: boolean;
  error: string | null;
  caseId: string | null;
  source: CaseSource;
  creatorUsername: string | null;
  title: string;
  scenario: string;
  suspects: Suspect[];
  clues: string[];
  phase: Phase;
  examSecondsTotal: ExamDurationSeconds;
  examSecondsLeft: number;
  cluesRevealed: number;
  selectedSuspectId: string | null;
  submitting: boolean;
  result: AccuseResponse | null;
  // Sharing or creating a case unlocks browsing community cases.
  unlocked: boolean;
  seenCommunityCaseIds: string[];
  communityLoading: boolean;
  communityError: string | null;
  // Cases this player has reported this session, keyed by caseId — used to
  // disable the report button after use without a round-trip to check.
  reportedCaseIds: string[];
  reportSubmitting: boolean;
};

const initialState: GameState = {
  loading: true,
  error: null,
  caseId: null,
  source: 'daily',
  creatorUsername: null,
  title: '',
  scenario: '',
  suspects: [],
  clues: [],
  phase: 'scenario',
  examSecondsTotal: 30,
  examSecondsLeft: 30,
  cluesRevealed: 0,
  selectedSuspectId: null,
  submitting: false,
  result: null,
  unlocked: false,
  seenCommunityCaseIds: [],
  communityLoading: false,
  communityError: null,
  reportedCaseIds: [],
  reportSubmitting: false,
};

// Resets all per-case fields to a freshly-fetched case, always landing back
// on the scenario screen. Shared by the initial load, "back to today's
// mystery", and "shuffle another community case".
const applyCase = (prev: GameState, data: CaseResponse): GameState => ({
  ...prev,
  loading: false,
  communityLoading: false,
  communityError: null,
  caseId: data.caseId,
  source: data.source,
  creatorUsername: data.creatorUsername ?? null,
  title: data.title,
  scenario: data.scenario,
  suspects: data.suspects,
  clues: data.clues,
  phase: 'scenario',
  examSecondsTotal: data.examSeconds,
  examSecondsLeft: data.examSeconds,
  cluesRevealed: 0,
  selectedSuspectId: null,
  result: null,
});

export const useMystery = () => {
  const [state, setState] = useState<GameState>(initialState);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/case');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: CaseResponse = await res.json();
        if (data.type !== 'case') throw new Error('Unexpected response');
        setState((prev) => applyCase(prev, data));
      } catch (err) {
        console.error('Failed to load case', err);
        setState((prev) => ({
          ...prev,
          loading: false,
          error: "Failed to load today's case.",
        }));
      }
    };
    void load();
  }, []);

  // Returns to today's daily case after browsing community cases.
  const loadDailyCase = useCallback(async () => {
    setState((prev) => ({ ...prev, communityLoading: true, communityError: null }));
    try {
      const res = await fetch('/api/case');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: CaseResponse = await res.json();
      if (data.type !== 'case') throw new Error('Unexpected response');
      setState((prev) => applyCase(prev, data));
    } catch (err) {
      console.error('Failed to load daily case', err);
      setState((prev) => ({
        ...prev,
        communityLoading: false,
        communityError: "Failed to load today's case.",
      }));
    }
  }, []);

  // Fetches a random community case, avoiding ones already seen this
  // session where possible. Also marks the app "unlocked", since playing a
  // community case is itself a form of unlocking more mysteries.
  const loadCommunityCase = useCallback(async () => {
    setState((prev) => ({ ...prev, communityLoading: true, communityError: null }));
    const exclude = [...state.seenCommunityCaseIds, ...(state.source === 'community' && state.caseId ? [state.caseId] : [])];
    try {
      const res = await fetch(`/api/community-cases/random?exclude=${encodeURIComponent(exclude.join(','))}`);
      if (res.status === 404) {
        setState((prev) => ({
          ...prev,
          communityLoading: false,
          communityError: 'No community cases yet — be the first to create one!',
        }));
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: CaseResponse = await res.json();
      if (data.type !== 'case') throw new Error('Unexpected response');
      setState((prev) => ({
        ...applyCase(prev, data),
        unlocked: true,
        seenCommunityCaseIds: [...prev.seenCommunityCaseIds, data.caseId],
      }));
    } catch (err) {
      console.error('Failed to load community case', err);
      setState((prev) => ({
        ...prev,
        communityLoading: false,
        communityError: 'Failed to load a community case.',
      }));
    }
  }, [state.seenCommunityCaseIds, state.source, state.caseId]);

  // Called after a successful share or a successful case creation.
  const unlock = useCallback(() => {
    setState((prev) => ({ ...prev, unlocked: true }));
  }, []);

  // Reports the current case for moderator review. Works for any case with
  // a creator to credit — community cases played via shuffle, and daily
  // picks that turn out to be a promoted community case.
  const reportCase = useCallback(async () => {
    const caseId = state.caseId;
    if (
      !caseId ||
      !state.creatorUsername ||
      state.reportSubmitting ||
      state.reportedCaseIds.includes(caseId)
    ) {
      return;
    }
    setState((prev) => ({ ...prev, reportSubmitting: true }));
    try {
      const res = await fetch(`/api/community-cases/${encodeURIComponent(caseId)}/report`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setState((prev) => ({
        ...prev,
        reportSubmitting: false,
        reportedCaseIds: [...prev.reportedCaseIds, caseId],
      }));
    } catch (err) {
      console.error('Failed to report case', err);
      setState((prev) => ({ ...prev, reportSubmitting: false }));
    }
  }, [state.caseId, state.creatorUsername, state.reportSubmitting, state.reportedCaseIds]);

  // Leaves the scenario briefing and starts the examination countdown.
  const startInvestigation = useCallback(() => {
    setState((prev) =>
      prev.phase === 'scenario' ? { ...prev, phase: 'examining' } : prev
    );
  }, []);

  // Lets the player pick how long the examination phase lasts before
  // starting. Only takes effect from the scenario screen — the case's own
  // examSeconds is just the default selection.
  const setExamDuration = useCallback((seconds: ExamDurationSeconds) => {
    setState((prev) =>
      prev.phase === 'scenario'
        ? { ...prev, examSecondsTotal: seconds, examSecondsLeft: seconds }
        : prev
    );
  }, []);

  // Examination countdown: ticks once a second while studying the suspects,
  // then hands off to the clue-guessing phase (clue 1 auto-revealed —
  // accusing with 0 clues is never allowed).
  useEffect(() => {
    if (state.phase !== 'examining' || state.loading) return;
    const timer = setInterval(() => {
      setState((prev) => {
        if (prev.phase !== 'examining') return prev;
        const remaining = prev.examSecondsLeft - 1;
        if (remaining <= 0) {
          return {
            ...prev,
            phase: 'clues',
            examSecondsLeft: 0,
            cluesRevealed: Math.min(1, prev.clues.length),
          };
        }
        return { ...prev, examSecondsLeft: remaining };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [state.phase, state.loading]);

  // Lets an impatient player jump straight to the clue-guessing phase
  // without waiting out the rest of the countdown.
  const skipExamination = useCallback(() => {
    setState((prev) =>
      prev.phase === 'examining'
        ? {
            ...prev,
            phase: 'clues',
            examSecondsLeft: 0,
            cluesRevealed: Math.min(1, prev.clues.length),
          }
        : prev
    );
  }, []);

  const nextClue = useCallback(() => {
    setState((prev) => ({
      ...prev,
      cluesRevealed: Math.min(prev.cluesRevealed + 1, prev.clues.length),
    }));
  }, []);

  const selectSuspect = useCallback((suspectId: string) => {
    setState((prev) =>
      prev.result ? prev : { ...prev, selectedSuspectId: suspectId }
    );
  }, []);

  const accuse = useCallback(async () => {
    if (!state.caseId || !state.selectedSuspectId || state.submitting || state.result) return;
    setState((prev) => ({ ...prev, submitting: true }));
    try {
      const res = await fetch('/api/accuse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseId: state.caseId,
          suspectId: state.selectedSuspectId,
          cluesRevealed: state.cluesRevealed,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: AccuseResponse = await res.json();
      setState((prev) => ({ ...prev, submitting: false, result: data }));
    } catch (err) {
      console.error('Failed to submit accusation', err);
      setState((prev) => ({
        ...prev,
        submitting: false,
        error: 'Failed to submit your guess.',
      }));
    }
  }, [state.caseId, state.selectedSuspectId, state.submitting, state.result, state.cluesRevealed]);

  const playAgain = useCallback(() => {
    setState((prev) => ({
      ...prev,
      phase: 'scenario',
      examSecondsLeft: prev.examSecondsTotal,
      cluesRevealed: 0,
      selectedSuspectId: null,
      result: null,
    }));
  }, []);

  return {
    ...state,
    reported: !!state.caseId && state.reportedCaseIds.includes(state.caseId),
    startInvestigation,
    setExamDuration,
    skipExamination,
    nextClue,
    selectSuspect,
    accuse,
    playAgain,
    loadDailyCase,
    loadCommunityCase,
    unlock,
    reportCase,
  };
};
