import type { BusinessHours } from "../api/hoursApi";

// Asia/Tashkent is UTC+05:00 all year (no DST), so a fixed offset is exact.
const OFFSET = 5 * 60 * 60 * 1000;
const toMin = (hm: string) => {
  const [h, m] = hm.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
};
const at = (t: Date, add: number, startMin: number) => new Date(Date.UTC(t.getUTCFullYear(), t.getUTCMonth(), t.getUTCDate() + add, Math.floor(startMin / 60), startMin % 60));

export function isWorkingTime(bh: BusinessHours, nowMs: number): boolean {
  const t = new Date(nowMs + OFFSET);
  const minute = t.getUTCHours() * 60 + t.getUTCMinutes();
  return bh.days.includes(t.getUTCDay() || 7) && minute >= toMin(bh.start) && minute < toMin(bh.end);
}

// `minutes` of working time after `fromMs`; outside working hours the clock starts at the next opening.
export function responseDeadline(bh: BusinessHours, fromMs: number, minutes = 30): number {
  const off = new Set(bh.holidays);
  const startMin = toMin(bh.start);
  const endMin = toMin(bh.end);
  const working = (d: Date) => bh.days.includes(d.getUTCDay() || 7) && !off.has(d.toISOString().slice(0, 10));
  let t = new Date(fromMs + OFFSET);
  let left = minutes;
  for (let guard = 0; guard < 400; guard++) {
    const minute = t.getUTCHours() * 60 + t.getUTCMinutes();
    if (!working(t) || minute >= endMin) { t = at(t, 1, startMin); continue; }
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
