import './index.css';

import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { showShareSheet } from '@devvit/web/client';
import { useMystery } from './hooks/useMystery';
import { CreateCaseScreen } from './CreateCaseScreen';
import { Screen, PlaceholderImage, ExamDurationPicker } from './ui';
import type { CaseSource, Suspect } from '../shared/api';

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
  const [view, setView] = useState<'play' | 'create'>('play');

  const {
    loading,
    error,
    source,
    creatorUsername,
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
    unlocked,
    communityLoading,
    communityError,
    reported,
    reportSubmitting,
    reportCase,
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
  } = useMystery();

  const handleShare = async () => {
    try {
      await showShareSheet({
        title: 'Daily Mystery',
        text: "Can you find the culprit? Try today's case!",
      });
      unlock();
    } catch (err) {
      console.error('Share failed', err);
    }
  };

  if (view === 'create') {
    return (
      <CreateCaseScreen
        onBack={() => setView('play')}
        onCreated={() => {
          setView('play');
          unlock();
        }}
      />
    );
  }

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
          <CaseHeader
            source={source}
            creatorUsername={creatorUsername}
            title={title}
            reported={reported}
            reportSubmitting={reportSubmitting}
            onReport={reportCase}
          />

          <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed">
            {scenario}
          </p>

          <ExamDurationPicker value={examSecondsTotal} onChange={setExamDuration} />

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
          <CaseHeader
            source={source}
            creatorUsername={creatorUsername}
            title={title}
            reported={reported}
            reportSubmitting={reportSubmitting}
            onReport={reportCase}
          />

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
            <button
              className="text-sm font-medium text-[#d93900] dark:text-orange-400 cursor-pointer"
              onClick={skipExamination}
            >
              Skip / I'm ready →
            </button>
          </section>

          <div className="flex flex-col gap-5">
            {suspects.map((suspect) => (
              <SuspectCard
                key={suspect.id}
                suspect={suspect}
                showImage
                isSelected={false}
                isCulpritReveal={false}
                disabled
                onSelect={() => {}}
                stacked
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
        <CaseHeader
          source={source}
          creatorUsername={creatorUsername}
          title={title}
          reported={reported}
          reportSubmitting={reportSubmitting}
          onReport={reportCase}
        />

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
          <>
            <ResultCard result={result} onPlayAgain={playAgain} />
            {source === 'community' ? (
              <CommunityNavSection
                loading={communityLoading}
                error={communityError}
                onShuffle={loadCommunityCase}
                onBackToDaily={loadDailyCase}
              />
            ) : (
              <NextMysterySection
                unlocked={unlocked}
                loading={communityLoading}
                error={communityError}
                onShare={handleShare}
                onCreateOwn={() => setView('create')}
                onShuffle={loadCommunityCase}
              />
            )}
          </>
        )}
      </div>
    </Screen>
  );
};

const CaseHeader = ({
  source,
  creatorUsername,
  title,
  reported,
  reportSubmitting,
  onReport,
}: {
  source: CaseSource;
  creatorUsername: string | null;
  title: string;
  reported: boolean;
  reportSubmitting: boolean;
  onReport: () => void;
}) => (
  <header className="text-center">
    <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
      {source === 'community' ? 'Community Mystery' : 'Daily Mystery'}
    </h1>
    <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
    {creatorUsername && (
      <div className="flex items-center justify-center gap-2">
        <p className="text-xs text-gray-400 dark:text-gray-500">by u/{creatorUsername}</p>
        <button
          type="button"
          onClick={onReport}
          disabled={reported || reportSubmitting}
          className="text-xs text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 disabled:hover:text-gray-400 dark:disabled:hover:text-gray-500 cursor-pointer disabled:cursor-default"
        >
          {reported ? '🚩 Reported' : '🚩 Report'}
        </button>
      </div>
    )}
  </header>
);

const SuspectCard = ({
  suspect,
  showImage,
  isSelected,
  isCulpritReveal,
  disabled,
  onSelect,
  stacked = false,
}: {
  suspect: Suspect;
  showImage: boolean;
  isSelected: boolean;
  isCulpritReveal: boolean;
  disabled: boolean;
  onSelect: () => void;
  stacked?: boolean;
}) => (
  <button
    onClick={onSelect}
    disabled={disabled}
    className={[
      'w-full flex rounded-lg text-left transition-colors cursor-pointer disabled:cursor-default',
      stacked ? 'flex-col items-center gap-2 py-2 text-center' : 'flex-row items-center gap-3 px-2 py-2',
      isCulpritReveal
        ? 'bg-green-50 dark:bg-green-900/30'
        : isSelected
          ? 'bg-orange-50 dark:bg-orange-900/30'
          : '',
    ].join(' ')}
  >
    {showImage && (
      <PlaceholderImage
        src={suspect.imageUrl}
        alt={suspect.name}
        fallbackEmoji="🕵️"
        fit="contain"
        className={[
          stacked ? 'w-48 h-56 sm:w-56 sm:h-64' : 'w-24 h-24 sm:w-28 sm:h-28 shrink-0',
        ].join(' ')}
        emojiSize={stacked ? 'text-7xl' : 'text-4xl'}
      />
    )}
    <div className={stacked ? 'min-w-0 flex flex-col items-center gap-1' : 'min-w-0 flex-1'}>
      <div className={stacked ? 'flex items-center gap-2' : 'flex items-center justify-between gap-2'}>
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
      <p
        className={[
          'text-xs text-gray-500 dark:text-gray-400 italic',
          stacked ? 'max-w-xs' : 'line-clamp-2',
        ].join(' ')}
      >
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
        {result.correct && (
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {result.scored ? (
              <>
                Score: <span className="font-semibold">{result.score}</span>
              </>
            ) : (
              <>
                Score: <span className="font-semibold">{result.score}</span>{' '}
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  (your own case — not scored)
                </span>
              </>
            )}
          </p>
        )}
        <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed bg-white/60 dark:bg-black/20 rounded-lg p-3 text-left">
          {result.solution}
        </p>
        <button
          className="mt-2 text-sm font-medium text-[#d93900] dark:text-orange-400 cursor-pointer"
          onClick={onPlayAgain}
        >
          Play again
        </button>
      </div>

      {result.scored && <Leaderboard result={result} />}
    </div>
  );
};

// After a daily-case result: offer sharing (which unlocks community play
// immediately) or creating a case (unlocks it once saved). Once unlocked,
// a shuffle button appears to jump straight into a community case.
const NextMysterySection = ({
  unlocked,
  loading,
  error,
  onShare,
  onCreateOwn,
  onShuffle,
}: {
  unlocked: boolean;
  loading: boolean;
  error: string | null;
  onShare: () => void;
  onCreateOwn: () => void;
  onShuffle: () => void;
}) => (
  <section className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 flex flex-col items-center gap-3 text-center">
    <div>
      <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
        Want another case?
      </h2>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Share this with friends, or make your own.
      </p>
    </div>

    <div className="w-full flex flex-col gap-2">
      <button
        className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-100 font-semibold rounded-full py-2.5 cursor-pointer transition-colors hover:border-[#d93900] dark:hover:border-orange-500"
        onClick={onShare}
      >
        📤 Share with friends
      </button>
      <button
        className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-100 font-semibold rounded-full py-2.5 cursor-pointer transition-colors hover:border-[#d93900] dark:hover:border-orange-500"
        onClick={onCreateOwn}
      >
        ✏️ Create Your Own Mystery
      </button>
    </div>

    {unlocked && (
      <button
        className="text-sm font-medium text-[#d93900] dark:text-orange-400 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        onClick={onShuffle}
        disabled={loading}
      >
        {loading ? 'Loading…' : '🔀 Play a community case'}
      </button>
    )}
    {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
  </section>
);

// After a community-case result: keep the shuffle loop going, or head back
// to today's official case.
const CommunityNavSection = ({
  loading,
  error,
  onShuffle,
  onBackToDaily,
}: {
  loading: boolean;
  error: string | null;
  onShuffle: () => void;
  onBackToDaily: () => void;
}) => (
  <section className="flex flex-col items-center gap-2">
    <div className="w-full flex flex-col gap-2">
      <button
        className="w-full bg-[#d93900] dark:bg-orange-600 text-white font-semibold rounded-full py-2.5 cursor-pointer transition-colors hover:bg-[#c23300] dark:hover:bg-orange-700 disabled:opacity-40 disabled:cursor-not-allowed"
        onClick={onShuffle}
        disabled={loading}
      >
        {loading ? 'Loading…' : '🔀 Next community case'}
      </button>
      <button
        className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-100 font-semibold rounded-full py-2.5 cursor-pointer transition-colors hover:border-[#d93900] dark:hover:border-orange-500 disabled:opacity-40 disabled:cursor-not-allowed"
        onClick={onBackToDaily}
        disabled={loading}
      >
        🏠 Back to today's mystery
      </button>
    </div>
    {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
  </section>
);

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

// Keying on `state` forces a remount whenever the emotion changes, which
// restarts the CSS pop-in animation each time.
const Mascot = ({ state }: { state: MascotState }) => (
  <div key={state} className="mascot-pop-in">
    <PlaceholderImage
      src={MASCOT_SRC[state]}
      alt={`Detective mascot (${state})`}
      fallbackEmoji={MASCOT_FALLBACK_EMOJI[state]}
      fit="contain"
      className="w-28 h-28 sm:w-32 sm:h-32 mx-auto"
      emojiSize="text-6xl"
    />
  </div>
);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
