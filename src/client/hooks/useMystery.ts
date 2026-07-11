import { useCallback, useEffect, useState } from 'react';
import type {
  AccuseResponse,
  CaseResponse,
  ExamDurationSeconds,
  Suspect,
} from '../../shared/api';

type Phase = 'examining' | 'clues';

type GameState = {
  loading: boolean;
  error: string | null;
  caseId: string | null;
  title: string;
  suspects: Suspect[];
  clues: string[];
  phase: Phase;
  examSecondsTotal: ExamDurationSeconds;
  examSecondsLeft: number;
  cluesRevealed: number;
  selectedSuspectId: string | null;
  submitting: boolean;
  result: AccuseResponse | null;
};

const initialState: GameState = {
  loading: true,
  error: null,
  caseId: null,
  title: '',
  suspects: [],
  clues: [],
  phase: 'examining',
  examSecondsTotal: 30,
  examSecondsLeft: 30,
  cluesRevealed: 0,
  selectedSuspectId: null,
  submitting: false,
  result: null,
};

export const useMystery = () => {
  const [state, setState] = useState<GameState>(initialState);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/case');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: CaseResponse = await res.json();
        if (data.type !== 'case') throw new Error('Unexpected response');
        setState((prev) => ({
          ...prev,
          loading: false,
          caseId: data.caseId,
          title: data.title,
          suspects: data.suspects,
          clues: data.clues,
          phase: 'examining',
          examSecondsTotal: data.examSeconds,
          examSecondsLeft: data.examSeconds,
          cluesRevealed: 0,
        }));
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
    if (!state.selectedSuspectId || state.submitting || state.result) return;
    setState((prev) => ({ ...prev, submitting: true }));
    try {
      const res = await fetch('/api/accuse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
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
  }, [state.selectedSuspectId, state.submitting, state.result, state.cluesRevealed]);

  const playAgain = useCallback(() => {
    setState((prev) => ({
      ...prev,
      phase: 'examining',
      examSecondsLeft: prev.examSecondsTotal,
      cluesRevealed: 0,
      selectedSuspectId: null,
      result: null,
    }));
  }, []);

  return { ...state, nextClue, selectSuspect, accuse, playAgain };
};
