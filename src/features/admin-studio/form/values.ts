import type { Dict } from "@/shared/lib/json";
import type { Errors } from "./types";

export const str = (v: unknown): string => (typeof v === "string" ? v : typeof v === "number" && Number.isFinite(v) ? String(v) : "");
export const rec = (v: unknown): Dict => (v && typeof v === "object" && !Array.isArray(v) ? (v as Dict) : {});
export const list = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
export const recList = (v: unknown): Dict[] => list(v).map(rec);
export const strList = (v: unknown): string[] => (typeof v === "string" ? v.split(/[,\n]/) : list(v).map((x) => str(typeof x === "object" ? rec(x).value : x))).map((s) => s.trim()).filter(Boolean);

// Payload copy with one key set (undefined removes it).
export function withKey(payload: Dict, key: string, value: unknown): Dict {
  const next = { ...payload };
  if (value === undefined) delete next[key];
  else next[key] = value;
  return next;
}

// Error of a field or of anything nested under it ("items.2.label").
export function errorFor(errors: Errors, name: string): string {
  if (errors[name]) return errors[name];
  const hit = Object.keys(errors).find((k) => k.startsWith(`${name}.`) || k.startsWith(`${name}[`));
  return hit ? errors[hit] : "";
}

export const errorsUnder = (errors: Errors, prefix: string): Errors =>
  Object.fromEntries(Object.entries(errors).filter(([k]) => k.startsWith(`${prefix}.`)).map(([k, v]) => [k.slice(prefix.length + 1), v]));


export function moveItem<T>(items: T[], i: number, d: -1 | 1): T[] {
  const j = i + d;
  if (j < 0 || j >= items.length) return items;
  const next = items.slice();
  [next[i], next[j]] = [next[j], next[i]];
  return next;
}

const CYR: Record<string, string> = { а: "a", б: "b", в: "v", г: "g", ғ: "g", д: "d", е: "e", ё: "yo", ж: "j", з: "z", и: "i", й: "y", к: "k", қ: "q", л: "l", м: "m", н: "n", о: "o", ў: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "x", ҳ: "h", ц: "ts", ч: "ch", ш: "sh", щ: "sh", ъ: "", ы: "i", ь: "", э: "e", ю: "yu", я: "ya" };
// "Toshkent shahri" → "toshkent_shahri" (keys and slugs; Cyrillic is transliterated).
export const slugify = (label: string): string =>
  label.toLowerCase().replace(/[ʻʼ‘’'`]/g, "").split("").map((ch) => CYR[ch] ?? ch).join("").normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 60);
export const SNAKE_RE = /^[a-z][a-z0-9_]*$/;
