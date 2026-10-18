// Tolerant readers for backend payloads (same helpers as lib/http.ts on the web).
export type Dict = Record<string, unknown>;

export const asDict = (v: unknown): Dict =>
  v && typeof v === "object" && !Array.isArray(v) ? (v as Dict) : {};

export const asArr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);

export const asStr = (v: unknown, fallback = ""): string =>
  typeof v === "string" ? v : typeof v === "number" ? String(v) : fallback;

export const asNum = (v: unknown, fallback = 0): number => {
  const n = typeof v === "string" ? Number(v) : v;
  return typeof n === "number" && Number.isFinite(n) ? n : fallback;
};

// Find the first array under one of `keys`, or the payload itself when it is a list.
export function listFrom(data: unknown, ...keys: string[]): unknown[] {
  if (Array.isArray(data)) return data;
  const d = asDict(data);
  for (const k of keys) if (Array.isArray(d[k])) return d[k] as unknown[];
  return [];
}

// Money fields arrive as whole so'm, sometimes as strings.
export const uzs = (d: Dict, ...keys: string[]): number => {
  for (const k of keys) {
    const n = asNum(d[k], NaN);
    if (Number.isFinite(n)) return n;
  }
  return 0;
};
