import { http } from "@/shared/api";
import { asArr, asDict, asNum, asStr } from "@/shared/lib/json";

export type BusinessHours = { days: number[]; start: string; end: string; workingDay: boolean | null; workingTime: boolean | null };

// Same schedule the web falls back to: Monday–Saturday, 09:00–19:00, Asia/Tashkent.
export const DEFAULT_HOURS: BusinessHours = { days: [1, 2, 3, 4, 5, 6], start: "09:00", end: "19:00", workingDay: null, workingTime: null };

const flag = (v: unknown): boolean | null => (typeof v === "boolean" ? v : null);

// GET /calendar/business-hours — {schedule: {days, start, end}, current: {is_working_day, is_working_time}}.
export async function getBusinessHours(): Promise<BusinessHours> {
  const d = asDict(await http("/calendar/business-hours"));
  const sch = asDict(d.schedule);
  const cur = asDict(d.current);
  const days = asArr(sch.days ?? d.working_days).map((x) => asNum(x)).filter((n) => n >= 1 && n <= 7);
  return {
    days: days.length ? days : DEFAULT_HOURS.days,
    start: asStr(sch.start ?? d.start, DEFAULT_HOURS.start).slice(0, 5),
    end: asStr(sch.end ?? d.end, DEFAULT_HOURS.end).slice(0, 5),
    workingDay: flag(cur.is_working_day),
    workingTime: flag(cur.is_working_time),
  };
}
