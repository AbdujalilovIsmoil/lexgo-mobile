import { dayKey, type BusinessHours } from "@/entities/business-hours";

/** "Du–Sh, 09:00–19:00": consecutive days collapse to a range; `dayName` translates mon…sun. */
export function scheduleText(h: Pick<BusinessHours, "days" | "start" | "end">, dayName: (key: string) => string): string {
  const days = [...h.days].sort((a, b) => a - b);
  const run = days.length > 1 && days.every((v, i) => i === 0 || v === days[i - 1] + 1);
  const text = run ? `${dayName(dayKey(days[0]))}–${dayName(dayKey(days[days.length - 1]))}` : days.map((d) => dayName(dayKey(d))).join(", ");
  return `${text}, ${h.start}–${h.end}`;
}
