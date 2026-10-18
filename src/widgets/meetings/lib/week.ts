import { dayKey } from "./groupByDay";

export type WeekDay = { key: string; date: Date; num: number; today: boolean };
export type Phase = "live" | "soon" | "later" | "over";

/** Monday 00:00 of the week that contains `d`. */
export function startOfWeek(d: Date): Date {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
  return x;
}

/** The seven days (Monday first) of the week around `anchor`; `today` marks the current day. */
export function weekDays(anchor: Date, now: Date): WeekDay[] {
  const s = startOfWeek(anchor);
  const today = dayKey(now);
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(s.getFullYear(), s.getMonth(), s.getDate() + i);
    const key = dayKey(date);
    return { key, date, num: date.getDate(), today: key === today };
  });
}

/** The same weekday `n` weeks later (negative → earlier). */
export const shiftWeek = (anchor: Date, n: number): Date => new Date(anchor.getFullYear(), anchor.getMonth(), anchor.getDate() + 7 * n);

/** Meetings per day (a day with a count gets the dot under its chip). */
export function dayCounts(items: { startedAt: string }[]): Map<string, number> {
  const out = new Map<string, number>();
  for (const m of items) { const k = dayKey(m.startedAt); out.set(k, (out.get(k) ?? 0) + 1); }
  return out;
}

/** Meetings of one day; no key → everything. */
export const onDay = <T extends { startedAt: string }>(items: T[], key: string | null): T[] => (key ? items.filter((m) => dayKey(m.startedAt) === key) : items);

/**
 * Where a meeting is in its life: "live" (running), "soon" (scheduled within `soonMin` minutes or already due),
 * "later" (scheduled further ahead) or "over" (ended / cancelled / expired). Join is offered for live and soon.
 */
export function phaseOf(m: { callStatus: string; startedAt: string }, now: Date, soonMin = 15): Phase {
  if (m.callStatus === "active") return "live";
  if (m.callStatus !== "scheduled") return "over";
  const at = Date.parse(m.startedAt);
  return Number.isNaN(at) || at - now.getTime() <= soonMin * 60_000 ? "soon" : "later";
}
