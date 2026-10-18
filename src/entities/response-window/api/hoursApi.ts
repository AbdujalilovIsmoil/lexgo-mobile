import { http } from "@/shared/api";
import { asArr, asDict, asStr } from "@/shared/lib/json";

export type BusinessHours = { days: number[]; start: string; end: string; holidays: string[] };

export const DEFAULT_HOURS: BusinessHours = { days: [1, 2, 3, 4, 5, 6], start: "09:00", end: "19:00", holidays: [] };

const hm = (v: unknown, fb: string): string => {
  const m = typeof v === "string" ? /^(\d{1,2}):(\d{2})/.exec(v.trim()) : null;
  return m && Number(m[1]) <= 24 && Number(m[2]) < 60 ? `${m[1].padStart(2, "0")}:${m[2]}` : fb;
};

// Day names only ("monday", "Mon", {day: "tue"}); numeric arrays are ambiguous and ignored.
function isoDays(v: unknown): number[] | null {
  const NAMES = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
  const out: number[] = [];
  for (const x of asArr(v)) {
    const r = asDict(x);
    if (r.closed === true || r.is_working_day === false || r.working === false || r.open === false) continue;
    const name = r.day ?? x;
    const idx = typeof name === "string" ? NAMES.indexOf(name.trim().toLowerCase().slice(0, 3)) : -1;
    if (idx < 0) return null;
    out.push(idx + 1);
  }
  return out.length ? [...new Set(out)].sort((a, b) => a - b) : null;
}

// GET /calendar/business-hours — the advocate's 30-minute response window runs on this schedule.
export async function getBusinessHours(): Promise<BusinessHours> {
  const d = asDict(await http("/calendar/business-hours"));
  const hours = asDict(d.hours ?? d.working_hours ?? d.business_hours);
  const first = asDict(asArr(d.schedule)[0]);
  const holidays = asArr(d.holidays)
    .map((h) => asStr(typeof h === "string" ? h : asDict(h).date ?? asDict(h).day))
    .filter((x) => /^\d{4}-\d{2}-\d{2}/.test(x))
    .map((x) => x.slice(0, 10));
  return {
    days: isoDays(d.working_days ?? d.business_days ?? d.days ?? hours.days ?? d.schedule) ?? DEFAULT_HOURS.days,
    start: hm(d.start ?? d.start_time ?? d.work_start ?? d.opens_at ?? hours.start ?? hours.from ?? first.start, "09:00"),
    end: hm(d.end ?? d.end_time ?? d.work_end ?? d.closes_at ?? hours.end ?? hours.to ?? first.end, "19:00"),
    holidays,
  };
}
