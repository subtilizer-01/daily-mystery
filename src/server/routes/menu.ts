import { Hono } from 'hono';
import type { UiResponse } from '@devvit/web/shared';
import { context } from '@devvit/web/server';
import { createPost } from '../core/post';
import { resetLeaderboard } from '../core/leaderboard';
import { getReportedCases } from '../core/communityCases';

export const menu = new Hono();

menu.post('/post-create', async (c) => {
  try {
    const post = await createPost();

    return c.json<UiResponse>(
      {
        navigateTo: `https://reddit.com/r/${context.subredditName}/comments/${post.id}`,
      },
      200
    );
  } catch (error) {
    console.error(`Error creating post: ${error}`);
    return c.json<UiResponse>(
      {
        showToast: 'Failed to create post',
      },
      400
    );
  }
});

menu.post('/reset-leaderboard', async (c) => {
  try {
    await resetLeaderboard();
    return c.json<UiResponse>({ showToast: 'Leaderboard reset — all scores cleared.' }, 200);
  } catch (error) {
    console.error(`Error resetting leaderboard: ${error}`);
    return c.json<UiResponse>({ showToast: 'Failed to reset leaderboard' }, 400);
  }
});

// Moderator-only entry point into the report queue (gated by `forUserType:
// "moderator"` in devvit.json — enforced by the platform, not this code).
// Builds the review form on the fly from whatever's currently reported, so
// it always reflects the live queue rather than a fixed set of fields.
menu.post('/review-reported-cases', async (c) => {
  try {
    const reported = await getReportedCases();
    if (!reported.length) {
      return c.json<UiResponse>({ showToast: 'No reported cases pending review.' }, 200);
    }

    const options = reported.map((kase) => ({
      label: `"${kase.title}" by u/${kase.creatorUsername} — ${kase.reportCount} report${kase.reportCount === 1 ? '' : 's'}`,
      value: kase.id,
    }));

    return c.json<UiResponse>(
      {
        showForm: {
          name: 'reviewReportedCases',
          form: {
            title: 'Review reported cases',
            description: 'Pick cases to dismiss (return to play) or remove (delete permanently). Leave unselected to leave pending.',
            acceptLabel: 'Apply',
            fields: [
              {
                type: 'select',
                name: 'restoreIds',
                label: 'Dismiss report — case is fine, return it to play',
                options,
                multiSelect: true,
              },
              {
                type: 'select',
                name: 'removeIds',
                label: 'Remove permanently',
                options,
                multiSelect: true,
              },
            ],
          },
        },
      },
      200
    );
  } catch (error) {
    console.error(`Error loading reported cases: ${error}`);
    return c.json<UiResponse>({ showToast: 'Failed to load reported cases.' }, 400);
  }
});
