import type { WeeklyDay } from "../model/types";
import { fromMin, toMin } from "./time";

export const DAY_MINUTES = 1440;
export const LAST_MINUTE = DAY_MINUTES - 1; // 23:59 — the latest end the API's HH:MM accepts

export type PresetKind = "work" | "daily" | "full" | "clear";

const open = (day: number, start: string, end: string): WeeklyDay => ({ day, enabled: true, start, end });

// Quick weeks. "work" = Mon–Fri 09–18 (weekend off), "daily" = every day 09–18, "full" = round the clock, "clear" = all days off.
export function applyPreset(weekly: WeeklyDay[], kind: PresetKind): WeeklyDay[] {
  return weekly.map((d) => {
    if (kind === "work") return d.day < 5 ? open(d.day, "09:00", "18:00") : { ...d, enabled: false };
    if (kind === "daily") return open(d.day, "09:00", "18:00");
    if (kind === "full") return open(d.day, "00:00", fromMin(LAST_MINUTE));
    return { ...d, enabled: false };
  });
}

// Which preset the week equals right now (to highlight its chip), or null.
export function presetOf(weekly: WeeklyDay[]): PresetKind | null {
  const kinds: PresetKind[] = ["work", "daily", "full", "clear"];
  const key = (w: WeeklyDay[]) => JSON.stringify(w.map((d) => (d.enabled ? [d.day, d.start, d.end] : [d.day])));
  return kinds.find((k) => key(applyPreset(weekly, k)) === key(weekly)) ?? null;
}

// Hours of one open day on every day of the week (the source day must be open).
export function copyToAll(weekly: WeeklyDay[], from: number): WeeklyDay[] {
  const src = weekly.find((d) => d.day === from);
  if (!src || !src.enabled) return weekly;
  return weekly.map((d) => ({ ...d, enabled: true, start: src.start, end: src.end }));
}

export const rangeValid = (start: string, end: string) => toMin(start) < toMin(end);

// Moves HH:MM by `delta` minutes, snapped to `step` and kept inside 00:00–23:59.
export function stepTime(hm: string, delta: number, step = 5): string {
  const cur = toMin(hm);
  const base = Number.isNaN(cur) ? 540 : cur;
  const next = Math.round((base + delta) / step) * step;
  return fromMin(Math.max(0, Math.min(LAST_MINUTE, next)));
}

// Sets only the hour or only the minute of HH:MM.
export function withPart(hm: string, part: "h" | "m", n: number): string {
  const cur = toMin(hm);
  const base = Number.isNaN(cur) ? 540 : cur;
  const h = part === "h" ? n : Math.floor(base / 60);
  const m = part === "m" ? n : base % 60;
  return fromMin(Math.max(0, Math.min(LAST_MINUTE, h * 60 + m)));
}

// Left offset and width of the working range on a 24 h bar, as fractions 0..1 (null while the range is invalid).
export function barGeometry(start: string, end: string): { left: number; width: number } | null {
  const a = toMin(start);
  const b = toMin(end);
  if (Number.isNaN(a) || Number.isNaN(b) || a >= b) return null;
  const lo = Math.max(0, a);
  const hi = Math.min(DAY_MINUTES, b);
  return { left: lo / DAY_MINUTES, width: (hi - lo) / DAY_MINUTES };
}

// "9 h 30 min" style length of a range in minutes (0 when invalid).
export function rangeMinutes(start: string, end: string): number {
  return rangeValid(start, end) ? toMin(end) - toMin(start) : 0;
}

export type NextOpen = { dayOffset: number; day: number; time: string };
export type OpenState = { open: boolean; closesAt: string | null; next: NextOpen | null };

// Is the seller inside a working window at `day` (0 = Monday) / `minute` of the day, and when does the next window start?
export function openState(weekly: WeeklyDay[], day: number, minute: number): OpenState {
  const live = (d: WeeklyDay) => d.enabled && rangeValid(d.start, d.end);
  const today = weekly.find((d) => d.day === day);
  if (today && live(today) && minute >= toMin(today.start) && minute < toMin(today.end)) return { open: true, closesAt: today.end, next: null };
  for (let off = 0; off <= 7; off++) {
    const d = weekly.find((x) => x.day === (day + off) % 7);
    if (!d || !live(d)) continue;
    if (off === 0 && toMin(d.start) <= minute) continue; // today's window is already over
    return { open: false, closesAt: null, next: { dayOffset: off, day: d.day, time: d.start } };
  }
  return { open: false, closesAt: null, next: null };
}

// Weekday (0 = Monday) and minute of day of `date` in an IANA zone; falls back to Tashkent (UTC+5) if Intl lacks the zone.
export function clockIn(timezone: string, date: Date): { day: number; minute: number } {
  try {
    const parts = new Intl.DateTimeFormat("en-US", { timeZone: timezone, weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(date);
    const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
    const day = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].indexOf(get("weekday"));
    const minute = (Number(get("hour")) % 24) * 60 + Number(get("minute"));
    if (day >= 0 && !Number.isNaN(minute)) return { day, minute };
  } catch {
    // fall through to the fixed offset
  }
  const t = new Date(date.getTime() + 5 * 3600_000);
  return { day: (t.getUTCDay() + 6) % 7, minute: t.getUTCHours() * 60 + t.getUTCMinutes() };
}

export const DEADLINE_CHOICES = { manual: [15, 30, 60, 120], auto: [10, 15, 30, 60], sos: [5, 10, 15, 30] } as const;
