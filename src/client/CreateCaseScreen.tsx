import { useState } from 'react';
import { Screen, PlaceholderImage, ExamDurationPicker } from './ui';
import { SUSPECT_LIBRARY } from '../shared/suspectLibrary';
import type { CreateCaseRequest, ExamDurationSeconds } from '../shared/api';

const SUSPECT_COUNT = 5;
const CLUES_MIN = 2;
const CLUES_MAX = 4;

export const CreateCaseScreen = ({
  onBack,
  onCreated,
}: {
  onBack: () => void;
  onCreated: () => void;
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [scenario, setScenario] = useState('');
  const [statements, setStatements] = useState<Record<string, string>>({});
  const [culpritId, setCulpritId] = useState<string | null>(null);
  const [clues, setClues] = useState<string[]>(['', '']);
  const [examSeconds, setExamSeconds] = useState<ExamDurationSeconds>(30);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleSuspect = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        if (culpritId === id) setCulpritId(null);
        return prev.filter((x) => x !== id);
      }
      if (prev.length >= SUSPECT_COUNT) return prev;
      return [...prev, id];
    });
  };

  const updateClue = (index: number, value: string) => {
    setClues((prev) => prev.map((c, i) => (i === index ? value : c)));
  };
  const addClue = () => setClues((prev) => (prev.length < CLUES_MAX ? [...prev, ''] : prev));
  const removeClue = (index: number) =>
    setClues((prev) => (prev.length > CLUES_MIN ? prev.filter((_, i) => i !== index) : prev));

  const suspectsChosen = selectedIds.length === SUSPECT_COUNT;
  const ready =
    suspectsChosen &&
    title.trim().length > 0 &&
    scenario.trim().length > 0 &&
    selectedIds.every((id) => (statements[id] ?? '').trim().length > 0) &&
    !!culpritId &&
    clues.every((c) => c.trim().length > 0);

  const handleSubmit = async () => {
    if (!ready || submitting) return;
    setSubmitting(true);
    setError(null);

    const body: CreateCaseRequest = {
      title: title.trim(),
      scenario: scenario.trim(),
      suspects: selectedIds.map((id) => ({
        libraryId: id,
        statement: (statements[id] ?? '').trim(),
      })),
      culpritIndex: selectedIds.indexOf(culpritId!),
      clues: clues.map((c) => c.trim()),
      examSeconds,
    };

    try {
      const res = await fetch('/api/community-cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data: { message?: string } = await res.json();
      if (!res.ok) throw new Error(data.message ?? `HTTP ${res.status}`);
      onCreated();
    } catch (err) {
      console.error('Failed to create case', err);
      setError(err instanceof Error ? err.message : 'Failed to save your case.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen>
      <div className="w-full max-w-md flex flex-col gap-5 px-4 py-6">
        <header className="text-center">
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Create Your Own Mystery
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Build a case for the community to solve.
          </p>
        </header>

        <section className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              1. Pick 5 suspects
            </h2>
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {selectedIds.length}/{SUSPECT_COUNT}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {SUSPECT_LIBRARY.map((character) => {
              const selected = selectedIds.includes(character.id);
              const disabled = !selected && selectedIds.length >= SUSPECT_COUNT;
              return (
                <button
                  key={character.id}
                  type="button"
                  onClick={() => toggleSuspect(character.id)}
                  disabled={disabled}
                  className={[
                    'flex flex-col items-center gap-1 rounded-lg py-2 cursor-pointer transition-colors disabled:opacity-30 disabled:cursor-not-allowed',
                    selected ? 'bg-orange-50 dark:bg-orange-900/30' : '',
                  ].join(' ')}
                >
                  <PlaceholderImage
                    src={character.imageUrl}
                    alt={character.name}
                    fallbackEmoji="🕵️"
                    fit="contain"
                    className="w-16 h-16"
                    emojiSize="text-3xl"
                  />
                  <span className="text-[11px] font-medium text-gray-700 dark:text-gray-200 text-center leading-tight">
                    {character.name}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {suspectsChosen && (
          <>
            <section className="flex flex-col gap-2">
              <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                2. Title &amp; scenario
              </h2>
              <input
                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
                placeholder="Case title"
                maxLength={80}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <textarea
                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
                placeholder="What happened? Set the scene…"
                rows={3}
                maxLength={500}
                value={scenario}
                onChange={(e) => setScenario(e.target.value)}
              />
            </section>

            <section className="flex flex-col gap-3">
              <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                3. Statements — mark the culprit
              </h2>
              {selectedIds.map((id) => {
                const character = SUSPECT_LIBRARY.find((c) => c.id === id)!;
                return (
                  <div key={id} className="flex gap-3 items-start">
                    <PlaceholderImage
                      src={character.imageUrl}
                      alt={character.name}
                      fallbackEmoji="🕵️"
                      fit="contain"
                      className="w-14 h-14 shrink-0"
                      emojiSize="text-2xl"
                    />
                    <div className="min-w-0 flex-1 flex flex-col gap-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {character.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => setCulpritId(id)}
                          className={[
                            'text-[11px] font-semibold rounded-full px-2 py-0.5 cursor-pointer transition-colors shrink-0',
                            culpritId === id
                              ? 'bg-[#d93900] dark:bg-orange-600 text-white'
                              : 'border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400',
                          ].join(' ')}
                        >
                          {culpritId === id ? '🔍 Culprit' : 'Mark culprit'}
                        </button>
                      </div>
                      <textarea
                        className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 py-1.5 text-sm text-gray-900 dark:text-gray-100"
                        placeholder={`${character.name}'s statement / alibi…`}
                        rows={2}
                        maxLength={200}
                        value={statements[id] ?? ''}
                        onChange={(e) =>
                          setStatements((prev) => ({ ...prev, [id]: e.target.value }))
                        }
                      />
                    </div>
                  </div>
                );
              })}
            </section>

            <section className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                  4. Clues
                </h2>
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  {clues.length}/{CLUES_MAX}
                </span>
              </div>
              {clues.map((clue, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 w-4">
                    {i + 1}.
                  </span>
                  <input
                    className="flex-1 min-w-0 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
                    placeholder="A clue that narrows it down…"
                    maxLength={200}
                    value={clue}
                    onChange={(e) => updateClue(i, e.target.value)}
                  />
                  {clues.length > CLUES_MIN && (
                    <button
                      type="button"
                      onClick={() => removeClue(i)}
                      className="text-gray-400 dark:text-gray-500 cursor-pointer text-sm shrink-0"
                      aria-label="Remove clue"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              {clues.length < CLUES_MAX && (
                <button
                  type="button"
                  onClick={addClue}
                  className="self-start text-sm font-medium text-[#d93900] dark:text-orange-400 cursor-pointer"
                >
                  + Add clue
                </button>
              )}
            </section>

            <section className="flex flex-col gap-2">
              <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                5. Exam timer
              </h2>
              <ExamDurationPicker value={examSeconds} onChange={setExamSeconds} />
            </section>
          </>
        )}

        {error && <p className="text-sm text-red-600 dark:text-red-400 text-center">{error}</p>}

        <div className="flex flex-col gap-2">
          <button
            className="w-full bg-[#d93900] dark:bg-orange-600 text-white font-semibold rounded-full py-3 cursor-pointer transition-colors hover:bg-[#c23300] dark:hover:bg-orange-700 disabled:opacity-40 disabled:cursor-not-allowed"
            onClick={handleSubmit}
            disabled={!ready || submitting}
          >
            {submitting ? 'Saving…' : 'Save mystery'}
          </button>
          <button
            className="w-full text-sm font-medium text-gray-500 dark:text-gray-400 cursor-pointer"
            onClick={onBack}
          >
            ← Back
          </button>
        </div>
      </div>
    </Screen>
  );
};
