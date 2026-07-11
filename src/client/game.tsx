import './index.css';

import { StrictMode, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { useMystery } from './hooks/useMystery';
import { TRAITS } from './traits';
import type { Suspect } from '../shared/api';

export const App = () => {
  const {
    loading,
    error,
    title,
    suspects,
    clues,
    phase,
    examSecondsTotal,
    examSecondsLeft,
    cluesRevealed,
    selectedSuspectId,
    submitting,
    result,
    nextClue,
    selectSuspect,
    accuse,
    playAgain,
  } = useMystery();

  if (loading) {
    return (
      <Screen>
        <p className="text-gray-600 dark:text-gray-300">Loading today's case…</p>
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen>
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </Screen>
    );
  }

  if (phase === 'examining') {
    return (
      <Screen>
        <div className="w-full max-w-md flex flex-col gap-4 px-4 py-6">
          <header className="text-center">
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Daily Mystery
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          </header>

          <section className="text-center flex flex-col items-center gap-2">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Study the suspects — clues start soon
            </p>
            <div className="text-4xl font-bold tabular-nums text-[#d93900] dark:text-orange-400">
              {examSecondsLeft}s
            </div>
            <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#d93900] dark:bg-orange-500 transition-[width] duration-1000 ease-linear"
                style={{
                  width: `${(examSecondsLeft / examSecondsTotal) * 100}%`,
                }}
              />
            </div>
          </section>

          <div className="flex flex-col gap-1.5">
            {suspects.map((suspect) => (
              <SuspectCard
                key={suspect.id}
                suspect={suspect}
                showTraits
                isSelected={false}
                isCulpritReveal={false}
                disabled
                onSelect={() => {}}
              />
            ))}
          </div>
        </div>
      </Screen>
    );
  }

  const allCluesRevealed = cluesRevealed >= clues.length;

  return (
    <Screen>
      <div className="w-full max-w-md flex flex-col gap-5 px-4 py-6">
        <header className="text-center">
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Daily Mystery
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
        </header>

        <section className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              Clues
            </h2>
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {cluesRevealed} / {clues.length} revealed
            </span>
          </div>

          <ol className="flex flex-col gap-2">
            {clues.slice(0, cluesRevealed).map((clue, i) => (
              <li
                key={i}
                className="text-sm text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-700 rounded-lg px-3 py-2"
              >
                <span className="font-semibold mr-1">{i + 1}.</span>
                {clue}
              </li>
            ))}
          </ol>

          <button
            className="self-start text-sm font-medium text-[#d93900] dark:text-orange-400 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            onClick={nextClue}
            disabled={allCluesRevealed || !!result}
          >
            {allCluesRevealed ? 'All clues revealed' : 'Next clue →'}
          </button>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
            Who did it?
          </h2>
          <p className="text-xs text-gray-400 dark:text-gray-500 -mt-1">
            Recall what you saw during the examination.
          </p>
          <div className="flex flex-col gap-1.5">
            {suspects.map((suspect) => (
              <SuspectCard
                key={suspect.id}
                suspect={suspect}
                showTraits={!!result}
                isSelected={selectedSuspectId === suspect.id}
                isCulpritReveal={!!result && suspect.id === result.culpritId}
                disabled={!!result}
                onSelect={() => selectSuspect(suspect.id)}
              />
            ))}
          </div>
        </section>

        {!result ? (
          <button
            className="w-full bg-[#d93900] dark:bg-orange-600 text-white font-semibold rounded-full py-3 cursor-pointer transition-colors hover:bg-[#c23300] dark:hover:bg-orange-700 disabled:opacity-40 disabled:cursor-not-allowed"
            onClick={accuse}
            disabled={!selectedSuspectId || submitting}
          >
            {submitting ? 'Submitting…' : 'Accuse'}
          </button>
        ) : (
          <ResultCard result={result} onPlayAgain={playAgain} />
        )}
      </div>
    </Screen>
  );
};

const SuspectCard = ({
  suspect,
  showTraits,
  isSelected,
  isCulpritReveal,
  disabled,
  onSelect,
}: {
  suspect: Suspect;
  showTraits: boolean;
  isSelected: boolean;
  isCulpritReveal: boolean;
  disabled: boolean;
  onSelect: () => void;
}) => (
  <button
    onClick={onSelect}
    disabled={disabled}
    className={[
      'w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg border transition-colors cursor-pointer disabled:cursor-default',
      isCulpritReveal
        ? 'border-green-500 bg-green-50 dark:bg-green-900/30'
        : isSelected
          ? 'border-[#d93900] bg-orange-50 dark:bg-orange-900/30'
          : 'border-gray-200 dark:border-gray-700',
    ].join(' ')}
  >
    <div className="flex flex-col items-start min-w-0 shrink">
      <span
        className={[
          'text-sm font-medium truncate',
          isCulpritReveal
            ? 'text-green-700 dark:text-green-300'
            : 'text-gray-900 dark:text-gray-100',
        ].join(' ')}
      >
        {suspect.name}
      </span>
      {isCulpritReveal && (
        <span className="text-[10px] font-semibold text-green-700 dark:text-green-300">
          🔍 culprit
        </span>
      )}
    </div>

    {showTraits && (
      <div className="flex gap-1 shrink-0">
        {TRAITS.map((trait) => {
          const active = suspect.traits[trait.key];
          return (
            <span
              key={trait.key}
              title={`${trait.label}: ${active ? 'yes' : 'no'}`}
              className={[
                'flex items-center justify-center w-8 h-8 rounded-full text-lg leading-none transition-all',
                active
                  ? 'bg-white dark:bg-gray-900 ring-2 ring-[#d93900]/60 dark:ring-orange-500/60 opacity-100 scale-100'
                  : 'bg-transparent opacity-20 grayscale scale-90',
              ].join(' ')}
            >
              {trait.icon}
            </span>
          );
        })}
      </div>
    )}
  </button>
);

const ResultCard = ({
  result,
  onPlayAgain,
}: {
  result: NonNullable<ReturnType<typeof useMystery>['result']>;
  onPlayAgain: () => void;
}) => {
  return (
    <div
      className={[
        'rounded-xl p-4 flex flex-col items-center gap-2 text-center',
        result.correct
          ? 'bg-green-50 dark:bg-green-900/30'
          : 'bg-red-50 dark:bg-red-900/30',
      ].join(' ')}
    >
      <h2
        className={[
          'text-lg font-bold',
          result.correct
            ? 'text-green-700 dark:text-green-300'
            : 'text-red-700 dark:text-red-300',
        ].join(' ')}
      >
        {result.correct ? 'Case solved! 🎉' : 'Wrong suspect'}
      </h2>
      <p className="text-sm text-gray-700 dark:text-gray-200">
        The culprit was <span className="font-semibold">{result.culpritName}</span>.
      </p>
      <p className="text-sm text-gray-600 dark:text-gray-300">
        Score: <span className="font-semibold">{result.score}</span>
      </p>
      <button
        className="mt-2 text-sm font-medium text-[#d93900] dark:text-orange-400 cursor-pointer"
        onClick={onPlayAgain}
      >
        Play again
      </button>
    </div>
  );
};

const Screen = ({ children }: { children: ReactNode }) => (
  <div className="flex flex-col justify-center items-center min-h-screen bg-white dark:bg-gray-900">
    {children}
  </div>
);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
