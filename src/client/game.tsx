import './index.css';

import { StrictMode, useState, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { useMystery } from './hooks/useMystery';
import type { Suspect } from '../shared/api';

type MascotState = 'neutral' | 'happy' | 'nervous' | 'cry' | 'cheerful';

const MASCOT_SRC: Record<MascotState, string> = {
  neutral: '/mascot/neutral.png',
  happy: '/mascot/happy.png',
  nervous: '/mascot/nervous.png',
  cry: '/mascot/cry.png',
  cheerful: '/mascot/cheerful.png',
};

const MASCOT_FALLBACK_EMOJI: Record<MascotState, string> = {
  neutral: '🕵️',
  happy: '🙂',
  nervous: '😬',
  cry: '😢',
  cheerful: '🎉',
};

export const App = () => {
  const {
    loading,
    error,
    title,
    scenario,
    suspects,
    clues,
    phase,
    examSecondsTotal,
    examSecondsLeft,
    cluesRevealed,
    selectedSuspectId,
    submitting,
    result,
    startInvestigation,
    nextClue,
    selectSuspect,
    accuse,
    playAgain,
  } = useMystery();

  if (loading) {
    return (
      <Screen>
        <Mascot state="neutral" />
        <p className="text-gray-600 dark:text-gray-300">Loading today's case…</p>
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen>
        <Mascot state="neutral" />
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </Screen>
    );
  }

  if (phase === 'scenario') {
    return (
      <Screen>
        <div className="w-full max-w-md flex flex-col items-center gap-4 px-4 py-6 text-center">
          <Mascot state="neutral" />
          <header>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Daily Mystery
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          </header>

          <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed">
            {scenario}
          </p>

          <button
            className="w-full bg-[#d93900] dark:bg-orange-600 text-white font-semibold rounded-full py-3 cursor-pointer transition-colors hover:bg-[#c23300] dark:hover:bg-orange-700"
            onClick={startInvestigation}
          >
            Start Investigation
          </button>
        </div>
      </Screen>
    );
  }

  if (phase === 'examining') {
    return (
      <Screen>
        <div className="w-full max-w-md flex flex-col gap-4 px-4 py-6">
          <Mascot state="neutral" />
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
                showImage
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
  const cluesRemaining = clues.length - cluesRevealed;
  const mascotState: MascotState = result
    ? result.correct
      ? 'cheerful'
      : 'cry'
    : cluesRemaining <= 1
      ? 'nervous'
      : 'happy';

  return (
    <Screen>
      <div className="w-full max-w-md flex flex-col gap-5 px-4 py-6">
        <Mascot state={mascotState} />
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
                showImage={!!result}
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
  showImage,
  isSelected,
  isCulpritReveal,
  disabled,
  onSelect,
}: {
  suspect: Suspect;
  showImage: boolean;
  isSelected: boolean;
  isCulpritReveal: boolean;
  disabled: boolean;
  onSelect: () => void;
}) => (
  <button
    onClick={onSelect}
    disabled={disabled}
    className={[
      'w-full flex items-center gap-3 px-3 py-2 rounded-lg border text-left transition-colors cursor-pointer disabled:cursor-default',
      isCulpritReveal
        ? 'border-green-500 bg-green-50 dark:bg-green-900/30'
        : isSelected
          ? 'border-[#d93900] bg-orange-50 dark:bg-orange-900/30'
          : 'border-gray-200 dark:border-gray-700',
    ].join(' ')}
  >
    {showImage && (
      <PlaceholderImage
        src={suspect.imageUrl}
        alt={suspect.name}
        fallbackEmoji="🕵️"
        className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 shrink-0"
      />
    )}
    <div className="min-w-0 flex-1">
      <div className="flex items-center justify-between gap-2">
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
          <span className="text-[10px] font-semibold text-green-700 dark:text-green-300 shrink-0">
            🔍 culprit
          </span>
        )}
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 italic line-clamp-2">
        “{suspect.statement}”
      </p>
    </div>
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
    <div className="flex flex-col gap-4">
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
        {result.correct ? (
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Score: <span className="font-semibold">{result.score}</span>
          </p>
        ) : (
          result.solvabilityNote && (
            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed bg-white/60 dark:bg-black/20 rounded-lg p-3 text-left">
              {result.solvabilityNote}
            </p>
          )
        )}
        <button
          className="mt-2 text-sm font-medium text-[#d93900] dark:text-orange-400 cursor-pointer"
          onClick={onPlayAgain}
        >
          Play again
        </button>
      </div>

      <Leaderboard result={result} />
    </div>
  );
};

const Leaderboard = ({
  result,
}: {
  result: NonNullable<ReturnType<typeof useMystery>['result']>;
}) => {
  const { top, me } = result.leaderboard;
  const meInTop = !!me && top.some((row) => row.userId === me.userId);

  return (
    <section className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 flex flex-col gap-2">
      <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
        Leaderboard
      </h2>

      {top.length === 0 ? (
        <p className="text-xs text-gray-400 dark:text-gray-500">
          No scores yet — be the first!
        </p>
      ) : (
        <ol className="flex flex-col gap-1">
          {top.map((row) => (
            <li
              key={row.userId}
              className={[
                'flex items-center justify-between gap-2 text-sm px-2 py-1 rounded-lg',
                me?.userId === row.userId
                  ? 'bg-orange-50 dark:bg-orange-900/30 font-semibold text-[#d93900] dark:text-orange-300'
                  : 'text-gray-700 dark:text-gray-200',
              ].join(' ')}
            >
              <span className="truncate min-w-0">
                {row.rank}. {row.username}
              </span>
              <span className="tabular-nums shrink-0">{row.total}</span>
            </li>
          ))}
        </ol>
      )}

      {me && (
        <div className="mt-1 pt-2 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between gap-2 text-xs text-gray-600 dark:text-gray-300">
          <span className="truncate min-w-0">
            You: {me.total} total
            {!meInTop && me.percentile !== null && <> — Top {me.percentile}%</>}
          </span>
          <span className="tabular-nums shrink-0">This attempt: {result.score}</span>
        </div>
      )}
    </section>
  );
};

const Mascot = ({ state }: { state: MascotState }) => (
  <PlaceholderImage
    src={MASCOT_SRC[state]}
    alt={`Detective mascot (${state})`}
    fallbackEmoji={MASCOT_FALLBACK_EMOJI[state]}
    className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mx-auto"
    emojiSize="text-3xl"
  />
);

// Renders an <img>, falling back to an emoji badge if the src 404s — lets us
// wire up real art paths now and drop the files in later without breakage.
const PlaceholderImage = ({
  src,
  alt,
  fallbackEmoji,
  className,
  emojiSize = 'text-xl',
}: {
  src: string;
  alt: string;
  fallbackEmoji: string;
  className: string;
  emojiSize?: string;
}) => {
  const [broken, setBroken] = useState(false);
  return (
    <div
      className={`flex items-center justify-center overflow-hidden ${className}`}
    >
      {broken ? (
        <span className={emojiSize} role="img" aria-label={alt}>
          {fallbackEmoji}
        </span>
      ) : (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          onError={() => setBroken(true)}
        />
      )}
    </div>
  );
};

const Screen = ({ children }: { children: ReactNode }) => (
  <div className="flex flex-col justify-center items-center min-h-screen bg-white dark:bg-gray-900 gap-3">
    {children}
  </div>
);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
