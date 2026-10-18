import { humanizeSlug } from "../format";

type T = (key: string, params?: Record<string, string | number>) => string;

// Translation of a backend enum value, or the tidied value itself when no translation exists
// (never a raw "ns.key" in the UI).
export function tOr(t: T, key: string, value: string): string {
  const v = t(key);
  return v === key ? humanizeSlug(value) : v;
}
