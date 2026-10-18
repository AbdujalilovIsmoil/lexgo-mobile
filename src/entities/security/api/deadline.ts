// Server expiry → deadline on the phone clock. Only a sane remaining time (0–60 min) is
// trusted, capped at `maxMs`, so a skewed clock or a naive-UTC stamp can't show a wrong timer.
export function deadline(raw: unknown, fallbackMs = 2 * 60_000, maxMs = 10 * 60_000): number {
  const now = Date.now();
  const left = typeof raw === "string" || typeof raw === "number" ? new Date(raw).getTime() - now : NaN;
  return now + (left > 0 && left <= 3_600_000 ? Math.min(left, maxMs) : fallbackMs);
}
