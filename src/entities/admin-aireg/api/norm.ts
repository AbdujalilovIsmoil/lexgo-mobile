import { asArr, asDict, type Dict } from "@/shared/lib/json";

export const isDict = (v: unknown): v is Dict => Boolean(v) && typeof v === "object" && !Array.isArray(v);

// First non-empty string (numbers become text).
export function pick(...vals: unknown[]): string {
  for (const v of vals) {
    const s = typeof v === "string" ? v.trim() : typeof v === "number" && Number.isFinite(v) ? String(v) : "";
    if (s) return s;
  }
  return "";
}

// First non-empty long text, line endings normalised.
export function text(...vals: unknown[]): string {
  for (const v of vals) if (typeof v === "string" && v.trim()) return v.replace(/\r\n/g, "\n").replace(/^\n+|\s+$/g, "");
  return "";
}

export function amount(...vals: unknown[]): number {
  for (const v of vals) {
    const n = typeof v === "number" ? v : typeof v === "string" && /^\d+(\.\d+)?$/.test(v.trim()) ? parseFloat(v) : NaN;
    if (Number.isFinite(n) && n >= 0) return Math.round(n);
  }
  return 0;
}

// ISO string of the first parseable date; a timestamp without a zone is UTC.
export function when(...vals: unknown[]): string {
  for (const v of vals) {
    const s = typeof v === "string" ? v.trim() : "";
    const ms = typeof v === "number" ? v : Date.parse(/^\d{4}-\d{2}-\d{2}[T ][\d:.]+$/.test(s) ? `${s.replace(" ", "T")}Z` : s);
    if (Number.isFinite(ms)) return new Date(ms).toISOString();
  }
  return "";
}

export function personOf(v: unknown): string {
  if (typeof v === "string") {
    const s = v.trim();
    return /^[0-9a-f-]{16,}$/i.test(s) || /^\d+$/.test(s) ? "" : s;
  }
  if (!isDict(v)) return "";
  return pick(v.full_name, v.name, v.display_name, [pick(v.first_name), pick(v.last_name)].filter(Boolean).join(" "), v.phone, v.email);
}

export function strings(v: unknown): string[] {
  const out: string[] = [];
  for (const item of asArr(v)) {
    const s = typeof item === "string" ? item.trim() : pick(asDict(item).text, asDict(item).title, asDict(item).label, asDict(item).message, asDict(item).name);
    if (s && !out.includes(s)) out.push(s);
  }
  return out;
}

// The first array under one of `keys`, also one level inside data / result / payload.
export function listOf(raw: unknown, keys: string[], depth = 0): unknown[] {
  if (Array.isArray(raw)) return raw;
  if (!isDict(raw) || depth > 2) return [];
  for (const k of keys) if (Array.isArray(raw[k])) return raw[k] as unknown[];
  for (const k of ["data", "result", "payload"]) {
    const inner = isDict(raw[k]) ? listOf(raw[k], keys, depth + 1) : [];
    if (inner.length) return inner;
  }
  return [];
}
