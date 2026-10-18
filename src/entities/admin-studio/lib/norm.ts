import { asArr, asDict, asNum, asStr } from "@/shared/lib/json";

export const str = (v: unknown): string => (typeof v === "string" ? v : typeof v === "number" && Number.isFinite(v) ? String(v) : "");
export const first = (...vals: unknown[]): string => {
  for (const v of vals) {
    const s = str(v).trim();
    if (s) return s;
  }
  return "";
};
export const strings = (v: unknown): string[] =>
  asArr(v)
    .map((x) => (typeof x === "string" ? x : first(asDict(x).value, asDict(x).code, asDict(x).key, asDict(x).name)))
    .map((s) => s.trim())
    .filter(Boolean);

const LIST_KEYS = ["items", "data", "results", "objects", "rows", "list"];
export function listOf(raw: unknown, keys: string[] = LIST_KEYS): unknown[] {
  if (Array.isArray(raw)) return raw;
  const d = asDict(raw);
  for (const k of keys) if (Array.isArray(d[k])) return d[k] as unknown[];
  return [];
}

export function totalOf(raw: unknown, fallback: number): number {
  const d = asDict(raw);
  const n = asNum(d.total ?? d.count ?? d.total_count, NaN);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

export function personOf(v: unknown): string {
  if (typeof v === "string" || typeof v === "number") return str(v);
  const d = asDict(v);
  return first(d.full_name, d.name, d.display_name, d.phone, d.email, d.id);
}

export function boolOf(v: unknown): boolean | null {
  if (typeof v === "boolean") return v;
  if (v === 1 || v === "1" || v === "true") return true;
  if (v === 0 || v === "0" || v === "false") return false;
  return null;
}

export const timeOf = (...vals: unknown[]): string => first(...vals.filter((v) => typeof v === "string"));
export const lower = (v: unknown): string => asStr(v).trim().toLowerCase();
