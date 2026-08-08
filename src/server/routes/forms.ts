import { Hono } from 'hono';
import type { UiResponse } from '@devvit/web/shared';
import { removeCommunityCase, restoreCommunityCase } from '../core/communityCases';

type ExampleFormValues = {
  message?: string;
};

export const forms = new Hono();

forms.post('/example-submit', async (c) => {
  const { message } = await c.req.json<ExampleFormValues>();
  const trimmedMessage = typeof message === 'string' ? message.trim() : '';

  return c.json<UiResponse>(
    {
      showToast: trimmedMessage
        ? `Form says: ${trimmedMessage}`
        : 'Form submitted with no message',
    },
    200
  );
});

type ReviewReportedCasesFormValues = {
  restoreIds?: string[];
  removeIds?: string[];
};

forms.post('/review-reported-cases', async (c) => {
  try {
    const { restoreIds = [], removeIds = [] } = await c.req.json<ReviewReportedCasesFormValues>();

    // A case picked in both lists is removed — removal is the more
    // destructive, more specific action, so it wins the conflict.
    const toRestore = restoreIds.filter((id) => !removeIds.includes(id));

    await Promise.all([
      ...toRestore.map((id) => restoreCommunityCase(id)),
      ...removeIds.map((id) => removeCommunityCase(id)),
    ]);

    const parts: string[] = [];
    if (toRestore.length) parts.push(`${toRestore.length} restored`);
    if (removeIds.length) parts.push(`${removeIds.length} removed`);

    return c.json<UiResponse>(
      { showToast: parts.length ? parts.join(', ') + '.' : 'No changes made.' },
      200
    );
  } catch (error) {
    console.error(`Error reviewing reported cases: ${error}`);
    return c.json<UiResponse>({ showToast: 'Failed to update reported cases.' }, 400);
  }
});
