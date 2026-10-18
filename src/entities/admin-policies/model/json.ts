import type { Dict } from "@/shared/lib/json";

export const isPlain = (v: unknown): v is Dict => v !== null && typeof v === "object" && !Array.isArray(v);
export const isStrList = (v: unknown): v is string[] => Array.isArray(v) && v.every((x) => typeof x === "string");
export const isObjList = (v: unknown): v is Dict[] => Array.isArray(v) && v.length > 0 && v.every(isPlain);

// A value the user typed that is not valid yet (NaN number, broken JSON) — saving is blocked while any exists.
export const BAD = Symbol("bad");
export function hasBad(v: unknown): boolean {
  if (v === BAD || (typeof v === "number" && Number.isNaN(v))) return true;
  if (Array.isArray(v)) return v.some(hasBad);
  return isPlain(v) ? Object.values(v).some(hasBad) : false;
}

// Same shape with every number 0, string "", boolean false, list empty — the template of a new list row.
export function blankLike(v: unknown): unknown {
  if (typeof v === "number") return 0;
  if (typeof v === "string") return "";
  if (typeof v === "boolean") return false;
  if (Array.isArray(v)) return [];
  return isPlain(v) ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, blankLike(x)])) : null;
}

// Leaf paths → short text, to compare two versions of a policy.
export function flatten(v: unknown, path = "", out: Record<string, string> = {}): Record<string, string> {
  if (isPlain(v)) Object.entries(v).forEach(([k, x]) => flatten(x, path ? `${path}.${k}` : k, out));
  else if (isObjList(v)) v.forEach((x, i) => flatten(x, `${path}[${i + 1}]`, out));
  else out[path] = Array.isArray(v) ? v.join(", ") : String(v);
  return out;
}

export type Change = { path: string; from?: string; to?: string };
export function diff(prev: Dict | null, cur: Dict | null): Change[] {
  const a = flatten(prev ?? {});
  const b = flatten(cur ?? {});
  const paths = [...new Set([...Object.keys(a), ...Object.keys(b)])].filter((p) => !p.endsWith("work_id") && a[p] !== b[p]);
  return paths.map((path) => ({ path, from: a[path], to: b[path] }));
}

export const labelOf = (key: string) => key.replace(/[_-]+/g, " ").replace(/^./, (c) => c.toUpperCase());
