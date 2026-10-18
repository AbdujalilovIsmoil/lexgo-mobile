import { humanizeSlug } from "@/shared/lib/format";

type T = (key: string, p?: Record<string, string | number>) => string;

// Translated label of a backend code (`base` is the dictionary group, e.g. "admHrm.st"), or the tidied code when unknown.
export function codeLabel(t: T, base: string, code: string): string {
  const key = `${base}.${code.trim().toLowerCase()}`;
  const v = t(key);
  return v !== key ? v : humanizeSlug(code);
}

export const stLabel = (t: T, status: string) => codeLabel(t, "admHrm.st", status);
export const unitTypeLabel = (t: T, type: string) => codeLabel(t, "admHrmB.unitType", type);
export const entryLabel = (t: T, type: string) => codeLabel(t, "admHrmC.entry", type);
export const prioLabel = (t: T, p: string) => codeLabel(t, "admHrmC.prio", p);
export const srcLabel = (t: T, s: string) => codeLabel(t, "admHrmC.src", s);
