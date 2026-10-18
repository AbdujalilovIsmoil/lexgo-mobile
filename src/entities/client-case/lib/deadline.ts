import type { BusinessHours } from "../model/types";

const TZ = 5 * 60 * 60 * 1000; // Asia/Tashkent is UTC+05:00 all year
const toMin = (hm: string) => { const [h, m] = hm.split(":").map(Number); return (h || 0) * 60 + (m || 0); };

// `minutes` of working time after `fromMs`; outside working hours the clock starts at the next opening.
export function responseDeadline(bh: BusinessHours, fromMs: number, minutes = 30): number {
  const holidays = new Set(bh.holidays);
  const s = toMin(bh.start), e = toMin(bh.end);
  const open = (d: Date) => bh.days.includes(d.getUTCDay() || 7) && !holidays.has(d.toISOString().slice(0, 10));
  const next = (d: Date) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + 1, Math.floor(s / 60), s % 60));
  let t = new Date(fromMs + TZ);
  let left = minutes;
  for (let i = 0; i < 400; i++) {
    const m = t.getUTCHours() * 60 + t.getUTCMinutes();
    if (!open(t) || m >= e) { t = next(t); continue; }
    if (m < s) { t = new Date(Date.UTC(t.getUTCFullYear(), t.getUTCMonth(), t.getUTCDate(), Math.floor(s / 60), s % 60)); continue; }
    if (left <= e - m) { t = new Date(t.getTime() + left * 60000); break; }
    left -= e - m;
    t = next(t);
  }
  return t.getTime() - TZ;
}

// "Bugun 14:30" / "Ertaga 09:30" / "18.09, 09:30" in Tashkent time.
export function deadlineLabel(at: number, now: number, words: { today: string; tomorrow: string }): string {
  const d = new Date(at + TZ), n = new Date(now + TZ);
  const p = (x: number) => String(x).padStart(2, "0");
  const hmText = `${p(d.getUTCHours())}:${p(d.getUTCMinutes())}`;
  const day = (x: Date) => Date.UTC(x.getUTCFullYear(), x.getUTCMonth(), x.getUTCDate());
  const diff = Math.round((day(d) - day(n)) / 86400000);
  if (diff === 0) return `${words.today} ${hmText}`;
  if (diff === 1) return `${words.tomorrow} ${hmText}`;
  return `${p(d.getUTCDate())}.${p(d.getUTCMonth() + 1)}, ${hmText}`;
}

const WAITING = new Set(["new", "seller_selection", "sent_to_seller", "waiting_info"]);

// Deadline of the seller's answer for an order still waiting on it, else null.
export function orderDeadline(o: { status: string; createdAt: string } | undefined, bh: BusinessHours, now: number) {
  if (!o || !now || !WAITING.has(o.status) || !o.createdAt) return null;
  const from = new Date(o.createdAt).getTime();
  if (Number.isNaN(from)) return null;
  const at = responseDeadline(bh, from, 30);
  return { at, overdue: at < now };
}
