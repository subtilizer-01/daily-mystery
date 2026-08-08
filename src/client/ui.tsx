import { useState, type ReactNode } from 'react';
import type { ExamDurationSeconds } from '../shared/api';

export const EXAM_DURATION_OPTIONS: ExamDurationSeconds[] = [20, 30, 45, 60];

export const Screen = ({ children }: { children: ReactNode }) => (
  <div className="flex flex-col justify-center items-center min-h-screen bg-white dark:bg-gray-900 gap-3">
    {children}
  </div>
);

// Renders an <img>, falling back to an emoji badge if the src 404s — lets us
// wire up real art paths now and drop the files in later without breakage.
export const PlaceholderImage = ({
  src,
  alt,
  fallbackEmoji,
  className,
  fit = 'cover',
  emojiSize = 'text-xl',
}: {
  src: string;
  alt: string;
  fallbackEmoji: string;
  className: string;
  fit?: 'cover' | 'contain';
  emojiSize?: string;
}) => {
  const [broken, setBroken] = useState(false);
  return (
    <div className={`flex items-center justify-center overflow-hidden ${className}`}>
      {broken ? (
        <span className={emojiSize} role="img" aria-label={alt}>
          {fallbackEmoji}
        </span>
      ) : (
        <img
          src={src}
          alt={alt}
          className={fit === 'contain' ? 'w-full h-full object-contain' : 'w-full h-full object-cover'}
          onError={() => setBroken(true)}
        />
      )}
    </div>
  );
};

// Lets the player choose how long the examination countdown runs before
// they commit to starting the investigation. Reused by the daily/community
// scenario screen and the case-creation form.
export const ExamDurationPicker = ({
  value,
  onChange,
}: {
  value: ExamDurationSeconds;
  onChange: (seconds: ExamDurationSeconds) => void;
}) => (
  <div className="w-full flex flex-col items-center gap-1.5">
    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Examination time</span>
    <div className="w-full grid grid-cols-4 gap-2">
      {EXAM_DURATION_OPTIONS.map((seconds) => (
        <button
          key={seconds}
          type="button"
          onClick={() => onChange(seconds)}
          className={[
            'rounded-full py-2 text-sm font-semibold cursor-pointer transition-colors border',
            value === seconds
              ? 'bg-[#d93900] dark:bg-orange-600 border-[#d93900] dark:border-orange-600 text-white'
              : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-[#d93900] dark:hover:border-orange-500',
          ].join(' ')}
        >
          {seconds}s
        </button>
      ))}
    </div>
  </div>
);
