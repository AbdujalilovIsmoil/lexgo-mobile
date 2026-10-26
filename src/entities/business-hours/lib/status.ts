import { weekdayShort } from "@/shared/lib/calendarNames";
import type { BusinessHours } from "../api/hoursApi";

export type HoursState = "open" | "closed" | "dayOff";

const OFFSET = 5 * 60 * 60 * 1000; // Asia/Tashkent is UTC+05:00 all year (no DST), so a fixed offset is exact
const toMin = (hm: string) => {
  const [h, m] = hm.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
};
const at = (t: Date, add: number, startMin: number) => new Date(Date.UTC(t.getUTCFullYear(), t.getUTCMonth(), t.getUTCDate() + add, Math.floor(startMin / 60), startMin % 60));
// `t` is a Tashkent wall-clock time held in a UTC Date.
const workingDay = (bh: BusinessHours, t: Date) => bh.days.includes(t.getUTCDay() || 7) && !bh.holidays.includes(t.toISOString().slice(0, 10));

// Open / closed for today / day off, in Tashkent time, from the schedule (like evalBusinessHours() on the web). Computed, not taken from
// the server's "current" flags: those describe the moment of the request, and the schedule is kept on disk for days.
export function hoursState(bh: BusinessHours, nowMs = Date.now()): HoursState {
  const t = new Date(nowMs + OFFSET);
  if (!workingDay(bh, t)) return "dayOff";
  const minute = t.getUTCHours() * 60 + t.getUTCMinutes();
  return minute >= toMin(bh.start) && minute < toMin(bh.end) ? "open" : "closed";
}

export const isWorkingTime = (bh: BusinessHours, nowMs: number): boolean => hoursState(bh, nowMs) === "open";

// `minutes` of working time after `fromMs`; outside working hours the clock starts at the next opening.
export function responseDeadline(bh: BusinessHours, fromMs: number, minutes = 30): number {
  const startMin = toMin(bh.start);
  const endMin = toMin(bh.end);
  let t = new Date(fromMs + OFFSET);
  let left = minutes;
  for (let guard = 0; guard < 400; guard++) {
    const minute = t.getUTCHours() * 60 + t.getUTCMinutes();
    if (!workingDay(bh, t) || minute >= endMin) { t = at(t, 1, startMin); continue; }
    if (minute < startMin) { t = at(t, 0, startMin); continue; }
    if (left <= endMin - minute) { t = new Date(t.getTime() + left * 60000); break; }
    left -= endMin - minute;
    t = at(t, 1, startMin);
  }
  return t.getTime() - OFFSET;
}

// "Bugun 14:30" / "Ertaga 09:30" / "18.09, 09:30", in Tashkent time.
export function deadlineLabel(deadlineMs: number, nowMs: number, words: { today: string; tomorrow: string }): string {
  const d = new Date(deadlineMs + OFFSET);
  const n = new Date(nowMs + OFFSET);
  const p = (x: number) => String(x).padStart(2, "0");
  const time = `${p(d.getUTCHours())}:${p(d.getUTCMinutes())}`;
  const day = (x: Date) => Date.UTC(x.getUTCFullYear(), x.getUTCMonth(), x.getUTCDate());
  const diff = Math.round((day(d) - day(n)) / 86400000);
  if (diff === 0) return `${words.today} ${time}`;
  if (diff === 1) return `${words.tomorrow} ${time}`;
  return `${p(d.getUTCDate())}.${p(d.getUTCMonth() + 1)}, ${time}`;
}

// "Du–Sha" for a consecutive run of ISO days, otherwise a comma list.
export function daysLabel(days: number[], locale: string): string {
  const name = (d: number) => weekdayShort(d, locale);
  const run = days.length > 1 && days.every((d, i) => i === 0 || d === days[i - 1] + 1);
  return run ? `${name(days[0])}–${name(days[days.length - 1])}` : days.map(name).join(", ");
}
