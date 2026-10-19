// Retry schedule of the offline outbox: 5 s, 15 s, 45 s, 2 min, 5 min (capped), with up to 20% jitter so a
// whole fleet of phones that regained signal together does not hit the API in the same second.
const STEPS = [5_000, 15_000, 45_000, 120_000, 300_000];
export const MAX_ATTEMPTS = 8;

export function backoffMs(attempts: number, rand: () => number = Math.random): number {
  const base = STEPS[Math.min(Math.max(attempts, 1), STEPS.length) - 1];
  return Math.round(base * (1 + 0.2 * rand()));
}

// 4xx other than 401 / 408 / 409-with-retry / 429 will never succeed on a retry: drop instead of retrying forever.
export const isPermanentStatus = (status: number): boolean => status >= 400 && status < 500 && status !== 401 && status !== 408 && status !== 429;

/** Stable key for the backend: the same queued item always carries the same value, however often it is retried. */
export const idempotencyKey = (scope: string, kind: string, id: number, createdAt: number): string => `lexgo-${scope}-${kind}-${id}-${createdAt}`;

export type FlushVerdict = "stop" | "drop" | "retry" | "retry-stop";

/**
 * What the outbox does with an item whose send failed. `status`: HTTP status, 0 = no answer at all (offline,
 * timeout), -1 = not an HTTP error. stop = leave it untouched and end this run (no attempt counted); drop = it can
 * never succeed; retry = count an attempt and back off; retry-stop = same, and end this run.
 * 401 after the HTTP layer's own token refresh: signed out meanwhile → stop (the item waits for that account to sign
 * in again); still signed in → one attempt is counted and the run ends, so a dead token neither burns every item's
 * attempts in one go nor loops, and an item the server keeps refusing cannot block the queue for ever.
 */
export function flushVerdict(status: number, attempts: number, max = MAX_ATTEMPTS, signedIn = true): FlushVerdict {
  if (status === 0) return "stop";
  const last = attempts + 1 >= max;
  if (status === 401) return !signedIn ? "stop" : last ? "drop" : "retry-stop";
  if (isPermanentStatus(status) || last) return "drop";
  return "retry";
}
