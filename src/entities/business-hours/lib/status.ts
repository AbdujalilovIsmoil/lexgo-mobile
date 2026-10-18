import type { BusinessHours } from "../api/hoursApi";

export type HoursState = "open" | "closed" | "dayOff";

const TASHKENT_OFFSET_MS = 5 * 3_600_000; // UTC+5, no daylight saving

const minutes = (hm: string) => {
  const [h, m] = hm.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
};

// Open / closed-for-today / day-off, from the server flags when it sent them, otherwise computed
// in Tashkent time from the schedule (like evalBusinessHours() on the web).
export function hoursState(bh: BusinessHours, nowMs = Date.now()): HoursState {
  const local = new Date(nowMs + TASHKENT_OFFSET_MS);
  const iso = local.getUTCDay() || 7;
  const day = bh.workingDay ?? bh.days.includes(iso);
  const mins = local.getUTCHours() * 60 + local.getUTCMinutes();
  const time = bh.workingTime ?? (day && mins >= minutes(bh.start) && mins < minutes(bh.end));
  return time ? "open" : day ? "closed" : "dayOff";
}

// "Du–Sha" for a consecutive run of ISO days, otherwise a comma list.
export function daysLabel(days: number[], locale: string): string {
  const tag = locale === "ru" ? "ru-RU" : locale === "en" ? "en-GB" : "uz-UZ";
  const name = (d: number) => new Date(Date.UTC(2024, 0, d)).toLocaleDateString(tag, { weekday: "short", timeZone: "UTC" });
  const run = days.length > 1 && days.every((d, i) => i === 0 || d === days[i - 1] + 1);
  return run ? `${name(days[0])}–${name(days[days.length - 1])}` : days.map(name).join(", ");
}
