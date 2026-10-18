import { http } from "@/shared/api";
import { asArr, asDict, asStr } from "@/shared/lib/json";
import type { BusinessHours, Simulation } from "../model/types";

const hm = (v: unknown, fb: string) => (/^\d{1,2}:\d{2}/.test(asStr(v)) ? asStr(v).slice(0, 5) : fb);

// GET /calendar/business-hours — {schedule: {days, start, end, timezone}, current, holidays: ["YYYY-MM-DD"]}.
export async function getBusinessHours(): Promise<BusinessHours> {
  const d = asDict(await http("/calendar/business-hours"));
  const s = asDict(d.schedule);
  const cur = asDict(d.current);
  const open = cur.is_business_hours ?? cur.is_working_time;
  return {
    timezone: asStr(s.timezone ?? cur.timezone, "Asia/Tashkent"),
    days: asArr(s.days).map((x) => asStr(x).slice(0, 3).toLowerCase()),
    start: hm(s.start ?? cur.start, "09:00"),
    end: hm(s.end ?? cur.end, "19:00"),
    isWorkingTime: typeof open === "boolean" ? open : null,
    holidays: asArr(d.holidays).map((h) => asStr(typeof h === "string" ? h : asDict(h).date ?? asDict(h).day).slice(0, 10)).filter((x) => /^\d{4}-\d{2}-\d{2}$/.test(x)),
  };
}

// POST /admin/calendar/holidays {day, title} (cases.manage).
export async function addHoliday(day: string, title: string): Promise<void> {
  await http("/admin/calendar/holidays", { method: "POST", body: { day, title } });
}

// DELETE /admin/calendar/holidays/{day}.
export async function removeHoliday(day: string): Promise<void> {
  await http(`/admin/calendar/holidays/${encodeURIComponent(day)}`, { method: "DELETE" });
}

// GET /calendar/business-hours?at=<iso> answers for that moment: the advocate's 30-minute deadline at any time.
export async function simulate(atIso: string): Promise<Simulation> {
  const d = asDict(await http(`/calendar/business-hours?at=${encodeURIComponent(atIso)}`));
  const cur = asDict(d.current);
  return { isWorkingDay: cur.is_working_day === true, isWorkingTime: cur.is_business_hours === true || cur.is_working_time === true, nextWorkStart: asStr(cur.next_work_start), deadline30: asStr(d.confirmation_deadline_30m) };
}
