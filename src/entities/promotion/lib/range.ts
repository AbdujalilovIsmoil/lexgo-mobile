// The date filter of the reach analytics: both ends optional ("YYYY-MM-DD"), the span at most 90 days, start not after end.
export const MAX_RANGE_DAYS = 90;
export type RangeError = "order" | "long" | null;

const ms = (key: string) => Date.parse(`${key}T00:00:00Z`);

export function rangeError(from: string, to: string): RangeError {
  if (!from || !to) return null;
  const a = ms(from);
  const b = ms(to);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
  if (a > b) return "order";
  return Math.round((b - a) / 86_400_000) > MAX_RANGE_DAYS ? "long" : null;
}
