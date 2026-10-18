import { http } from "@/shared/api";
import { asArr, asDict, asStr } from "@/shared/lib/json";
import type { BusinessHours } from "../model/types";

export const DEFAULT_HOURS: BusinessHours = { days: [1, 2, 3, 4, 5, 6], start: "09:00", end: "19:00", holidays: [] };
const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

const hm = (v: unknown, fb: string): string => {
  const m = typeof v === "string" ? /^(\d{1,2}):(\d{2})/.exec(v.trim()) : null;
  return m && +m[1] < 25 && +m[2] < 60 ? `${m[1].padStart(2, "0")}:${m[2]}` : fb;
};

// Day names only: numeric arrays are ambiguous (0/1-based), so they are ignored.
function isoDays(v: unknown): number[] | null {
  const out: number[] = [];
  for (const x of asArr(v)) {
    const r = asDict(x);
    if (r.closed === true || r.is_working_day === false || r.working === false || r.open === false) continue;
    const name = r.day ?? x;
    const i = typeof name === "string" ? DAYS.indexOf(name.trim().toLowerCase().slice(0, 3)) : -1;
    if (i < 0) return null;
    out.push(i + 1);
  }
  return out.length ? [...new Set(out)].sort() : null;
}

// GET /calendar/business-hours — the seller's 30-minute answer window counts working time only.
export async function fetchBusinessHours(): Promise<BusinessHours> {
  const d = asDict(await http("/calendar/business-hours"));
  const h = asDict(d.hours ?? d.working_hours ?? d.business_hours);
  const first = asDict(asArr(d.schedule)[0]);
  const holidays = asArr(d.holidays).map((x) => asStr(typeof x === "string" ? x : asDict(x).date ?? asDict(x).day)).filter((x) => /^\d{4}-\d{2}-\d{2}/.test(x)).map((x) => x.slice(0, 10));
  return {
    days: isoDays(d.working_days ?? d.business_days ?? d.days ?? h.days ?? d.schedule) ?? DEFAULT_HOURS.days,
    start: hm(d.start ?? d.start_time ?? d.work_start ?? d.opens_at ?? h.start ?? h.from ?? first.start, "09:00"),
    end: hm(d.end ?? d.end_time ?? d.work_end ?? d.closes_at ?? h.end ?? h.to ?? first.end, "19:00"),
    holidays,
  };
}
