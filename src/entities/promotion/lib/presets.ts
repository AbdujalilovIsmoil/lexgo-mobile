export const PERIODS = [7, 14, 30, 90] as const;

const DAY = 86_400_000;
const ms = (k: string) => Date.parse(`${k}T00:00:00Z`);
const key = (t: number) => new Date(t).toISOString().slice(0, 10);

/** «Last N days» ending today (both days count): the dates a quick period fills in. */
export function periodRange(days: number, today: string): { from: string; to: string } {
  return { from: key(ms(today) - (days - 1) * DAY), to: today };
}

/** Which quick period the dates are (null = a custom range or an open one). */
export function matchPeriod(from: string, to: string, today: string): number | null {
  return PERIODS.find((d) => { const r = periodRange(d, today); return r.from === from && r.to === to; }) ?? null;
}

/** Days in a closed range, both ends counted (0 when an end is missing or the range is reversed). */
export function spanDays(from: string, to: string): number {
  const a = ms(from);
  const b = ms(to);
  return Number.isFinite(a) && Number.isFinite(b) && b >= a ? Math.round((b - a) / DAY) + 1 : 0;
}
