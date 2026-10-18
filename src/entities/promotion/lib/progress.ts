/** How far a running promotion is, 0…1 (from `startsAt` to `endsAt`); 0 when the dates are missing or reversed. */
export function progressOf(startsAt: string, endsAt: string, now = Date.now()): number {
  const a = Date.parse(startsAt);
  const b = Date.parse(endsAt);
  if (!Number.isFinite(a) || !Number.isFinite(b) || b <= a) return 0;
  return Math.min(1, Math.max(0, (now - a) / (b - a)));
}
