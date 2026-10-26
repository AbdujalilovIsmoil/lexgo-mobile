import { http } from "@/shared/api";
import { asArr, asDict, asStr } from "@/shared/lib/json";

// days: ISO weekdays (1 = Monday); start / end "HH:MM" in Asia/Tashkent; holidays "YYYY-MM-DD".
export type BusinessHours = { days: number[]; start: string; end: string; holidays: string[] };

// Same schedule the web falls back to: Monday–Saturday, 09:00–19:00, Asia/Tashkent.
export const DEFAULT_HOURS: BusinessHours = { days: [1, 2, 3, 4, 5, 6], start: "09:00", end: "19:00", holidays: [] };

const NAMES = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

const hm = (v: unknown, fb: string): string => {
  const m = typeof v === "string" ? /^(\d{1,2}):(\d{2})/.exec(v.trim()) : null;
  return m && Number(m[1]) <= 24 && Number(m[2]) < 60 ? `${m[1].padStart(2, "0")}:${m[2]}` : fb;
};

// Day names only ("monday", "Mon", {day: "tue"}); numbers are ambiguous (0- or 1-based) and make the whole list unusable.
function isoDays(v: unknown): number[] | null {
  const out: number[] = [];
  for (const x of asArr(v)) {
    const r = asDict(x);
    if (r.closed === true || r.is_working_day === false || r.working === false || r.open === false) continue;
    const name = r.day ?? x;
    const i = typeof name === "string" ? NAMES.indexOf(name.trim().toLowerCase().slice(0, 3)) : -1;
    if (i < 0) return null;
    out.push(i + 1);
  }
  return out.length ? [...new Set(out)].sort((a, b) => a - b) : null;
}

/** The ISO weekday's key, "mon" … "sun". */
export const dayKey = (iso: number): string => NAMES[(iso + 6) % 7];

// GET /calendar/business-hours — {schedule: {days: ["monday" …], start, end, timezone}, current: {…}, holidays: [], …}. The one reader of
// this endpoint: the hours chip, the 30-minute answer window, the support screens and the calendar all use it.
export async function getBusinessHours(): Promise<BusinessHours> {
  const d = asDict(await http("/calendar/business-hours"));
  const sch = asDict(d.schedule);
  const cur = asDict(d.current);
  return {
    days: isoDays(sch.days ?? d.working_days ?? d.days) ?? DEFAULT_HOURS.days,
    start: hm(sch.start ?? cur.start ?? d.start, DEFAULT_HOURS.start),
    end: hm(sch.end ?? cur.end ?? d.end, DEFAULT_HOURS.end),
    holidays: asArr(d.holidays)
      .map((x) => asStr(typeof x === "string" ? x : asDict(x).date ?? asDict(x).day))
      .filter((x) => /^\d{4}-\d{2}-\d{2}/.test(x))
      .map((x) => x.slice(0, 10)),
  };
}
