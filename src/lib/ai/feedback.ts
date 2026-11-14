import type { FeedbackRequest } from "@/lib/contracts";

export type FeedbackCounts = Record<FeedbackRequest["verdict"], number>;

/**
 * Keeps only the two anonymous totals. There is deliberately no document,
 * prompt, IP address, or user identifier anywhere in this module.
 */
export function createFeedbackCounter() {
  const counts: FeedbackCounts = { up: 0, down: 0 };

  return {
    record(verdict: FeedbackRequest["verdict"]): void {
      counts[verdict] += 1;
    },
    snapshot(): FeedbackCounts {
      return { ...counts };
    },
  };
}

// This is intentionally process-local until the team configures a privacy-reviewed
// metrics store. The route does not expose the counts to individual users.
const feedbackCounter = createFeedbackCounter();

export function recordFeedback(verdict: FeedbackRequest["verdict"]): void {
  feedbackCounter.record(verdict);
}
