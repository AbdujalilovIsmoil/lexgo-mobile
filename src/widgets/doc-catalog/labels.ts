import { categoryKey } from "@/entities/doc-template";
import { humanizeSlug } from "@/shared/lib/format";

type T = (key: string, vars?: Record<string, string | number>) => string;

// A category's display name: our short Uzbek name for the four known ones, else the server's title, else the key made readable.
export function categoryLabel(t: T, key: string, serverTitle = ""): string {
  const k = categoryKey(key);
  if (k) { const v = t(k); if (v !== k) return v; }
  return serverTitle || humanizeSlug(key.replace(/^legal-doc-/, ""));
}

// A language code ("uz-cyrl") in the person's own words; an unknown code is shown as it is, upper-case.
export function languageLabel(t: T, code: string): string {
  const k = `dcat.lang.${code}`;
  const v = t(k);
  return v === k ? code.toUpperCase() : v;
}

// The colour that tells the categories apart at a glance (civil blue, economic teal, administrative amber, criminal red).
export type Tone = "accent" | "ok" | "warn" | "err" | "gray";
export function categoryTone(key: string): Tone {
  if (key.endsWith("civil")) return "accent";
  if (key.endsWith("economic")) return "ok";
  if (key.endsWith("administrative")) return "warn";
  if (key.endsWith("criminal")) return "err";
  return "gray";
}

// About how long filling a template takes, from how many fields it asks: a third of a minute each, at least two minutes, rounded to five.
export function fillMinutes(fields: number): number {
  const m = Math.max(2, Math.round(fields * 0.3));
  return m <= 10 ? m : Math.round(m / 5) * 5;
}

// Descriptions that many documents share word for word ("a template-based constructor document…") say nothing about the one in hand:
// the set of those, from the rows loaded.
export function boilerplate(descriptions: string[], from = 6): Set<string> {
  const n = new Map<string, number>();
  for (const d of descriptions) if (d) n.set(d, (n.get(d) ?? 0) + 1);
  return new Set([...n].filter(([, c]) => c >= from).map(([d]) => d));
}
