export type DayKey = "today" | "yesterday" | "earlier";

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

// Which group an event belongs to: today, yesterday or earlier (device local time).
export function dayKey(iso: string, now = new Date()): DayKey {
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return "earlier";
  const diff = Math.round((startOfDay(now) - startOfDay(new Date(t))) / 86_400_000);
  return diff <= 0 ? "today" : diff === 1 ? "yesterday" : "earlier";
}
