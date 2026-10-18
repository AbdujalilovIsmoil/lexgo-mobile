import type { SupportHours } from "../model/types";

const ORDER = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

/** "Du–Sh, 09:00–19:00": consecutive days collapse to a range; `dayName` translates mon…sun. */
export function scheduleText(h: SupportHours, dayName: (key: string) => string): string {
  const idx = h.days.map((d) => ORDER.indexOf(d)).filter((i) => i >= 0).sort((a, b) => a - b);
  const run = idx.length > 1 && idx.every((v, i) => i === 0 || v === idx[i - 1] + 1);
  const days = run ? `${dayName(ORDER[idx[0]])}–${dayName(ORDER[idx[idx.length - 1]])}` : idx.map((i) => dayName(ORDER[i])).join(", ");
  return `${days}, ${h.start}–${h.end}`;
}
