import './index.css';

import { navigateTo } from '@devvit/web/client';
import { context, requestExpandedMode } from '@devvit/web/client';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// Solid fill sampled from the banner artwork's own dark-navy border, so the
// flat area around it reads as part of the image rather than empty space.
const BANNER_EDGE_COLOR = '#1b213c';

export const Splash = () => {
  return (
    <div
      className="flex relative flex-col justify-center items-center min-h-screen w-full gap-5 py-10"
      style={{ backgroundColor: BANNER_EDGE_COLOR }}
    >
      <img
        className="w-full object-contain"
        src="/snoo.png"
        alt="Daily Mystery — a new case every day, can you crack it?"
      />
      <div className="flex flex-col items-center gap-3 px-4">
        <p className="text-sm text-center text-gray-200">
          Can you find the culprit, {context.username ?? 'detective'}?
        </p>
        <button
          className="flex items-center justify-center bg-[#d93900] dark:bg-orange-600 text-white w-auto h-10 rounded-full cursor-pointer transition-colors px-6 hover:bg-[#c23300] dark:hover:bg-orange-700"
          onClick={(e) => requestExpandedMode(e.nativeEvent, 'game')}
        >
          Tap to Start
        </button>
      </div>
      <footer className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3 text-[0.8em] text-gray-400">
        <button
          className="cursor-pointer hover:text-white transition-colors"
          onClick={() => navigateTo('https://developers.reddit.com/docs')}
        >
          Docs
        </button>
        <span className="text-gray-600">|</span>
        <button
          className="cursor-pointer hover:text-white transition-colors"
          onClick={() => navigateTo('https://www.reddit.com/r/Devvit')}
        >
          r/Devvit
        </button>
        <span className="text-gray-600">|</span>
        <button
          className="cursor-pointer hover:text-white transition-colors"
          onClick={() => navigateTo('https://discord.com/invite/R7yu2wh9Qz')}
        >
          Discord
        </button>
      </footer>
    </div>
  );
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Splash />
  </StrictMode>
);
