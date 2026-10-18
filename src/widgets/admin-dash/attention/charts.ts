import type { DrillRow, DrillSection, Point } from "@/entities/admin-dash";
import { humanizeSlug } from "@/shared/lib/format";

// Sum `value` per calendar day, oldest first (feeds the trend line).
export function perDay<T>(items: T[], day: (i: T) => string, value: (i: T) => number = () => 1): Point[] {
  const m = new Map<string, number>();
  for (const i of items) {
    const d = day(i).slice(0, 10);
    if (d) m.set(d, (m.get(d) ?? 0) + value(i));
  }
  return [...m].sort(([a], [b]) => a.localeCompare(b)).map(([label, v]) => ({ label, value: v }));
}

// Count per key as bars, biggest first; `name` turns the slug into a label.
export function countBars<T>(title: string, items: T[], key: (i: T) => string, name: (k: string) => string = humanizeSlug): DrillSection {
  const m = new Map<string, number>();
  for (const i of items) m.set(key(i) || "—", (m.get(key(i) || "—") ?? 0) + 1);
  const rows: DrillRow[] = [...m].sort((a, b) => b[1] - a[1]).map(([k, n]) => ({ label: name(k), value: String(n), n }));
  return { kind: "bars", title, rows };
}

export const barsOf = (title: string, rows: { label: string; n: number; text: string }[]): DrillSection =>
  ({ kind: "bars", title, rows: rows.map((r) => ({ label: r.label, value: r.text, n: r.n })) });

export const lineOf = (title: string, points: Point[], format?: (n: number) => string): DrillSection => ({ kind: "series", title, points, format });
