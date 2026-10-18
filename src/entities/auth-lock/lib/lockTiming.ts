// Back in the app: is the lock due? `leftAt` = when it went to the background (epoch ms, 0 = unknown),
// `timeoutMin` = grace period in minutes (0 = lock on every return).
export function lockDue(leftAt: number, now: number, timeoutMin: number): boolean {
  if (!leftAt) return false;
  return now - leftAt >= timeoutMin * 60_000;
}
