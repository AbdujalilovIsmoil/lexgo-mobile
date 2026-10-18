import type { Invited } from "@/entities/call";

export type DaySection = { key: string; title: string; data: Invited[] };

/** Local calendar day of an ISO time or a Date ("?" when it does not parse). */
export const dayKey = (v: string | Date): string => { const d = new Date(v); return Number.isNaN(d.getTime()) ? "?" : `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`; };

// Groups meetings (already sorted) by calendar day; the title is "today" / "yesterday" / the date.
export function groupByDay(items: Invited[], label: (iso: string) => string): DaySection[] {
  const out: DaySection[] = [];
  for (const m of items) {
    const key = dayKey(m.startedAt);
    const last = out[out.length - 1];
    if (last && last.key === key) last.data.push(m);
    else out.push({ key, title: label(m.startedAt), data: [m] });
  }
  return out;
}

/** "Today" / "Yesterday" when it is, otherwise the formatted date. */
export function dayLabel(iso: string, now: Date, today: string, yesterday: string, fmt: (iso: string) => string): string {
  const y = new Date(now); y.setDate(y.getDate() - 1);
  const k = dayKey(iso);
  return k === dayKey(now.toISOString()) ? today : k === dayKey(y.toISOString()) ? yesterday : fmt(iso);
}
