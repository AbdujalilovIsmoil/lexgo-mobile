import { MAX_RANGE_DAYS } from "./range";
import { periodRange } from "./presets";
import type { Running } from "../model/types";

/** Day ("YYYY-MM-DD") the oldest running promotion started on, or "" when nothing runs. */
export function activeSince(running: Pick<Running, "startsAt">[]): string {
  const days = running.map((r) => r.startsAt.slice(0, 10)).filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d)).sort();
  return days[0] ?? "";
}

/** «Targ'ib davri»: from the start of the promotion to today, never longer than the analytics allow (90 days). */
export function promoPeriod(since: string, today: string): { from: string; to: string } {
  const floor = periodRange(MAX_RANGE_DAYS, today).from;
  return { from: since < floor ? floor : since > today ? today : since, to: today };
}
