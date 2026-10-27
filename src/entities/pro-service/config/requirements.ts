import { asDict } from "@/shared/lib/json";
import type { ReqValue } from "./types";

// Width of a progress bar, 0..100. Only the bar is clamped: the percent shown next to it stays the backend's number.
export const barPercent = (progress: number | null): number => (progress === null || !Number.isFinite(progress) ? 0 : Math.min(100, Math.max(0, progress)));

// `required.any_of`: the alternatives, any one of which completes the criterion (null = not an any_of target).
export function anyOfOptions(required: ReqValue): Record<string, unknown>[] | null {
  const list = asDict(required).any_of;
  if (!Array.isArray(list)) return null;
  const options = list.map(asDict).filter((o) => Object.keys(o).length > 0);
  return options.length ? options : null;
}

// One printable field of a value: `key` is "" for a scalar; objects give one part per field (any_of is shown on its own).
export type Part = { key: string; value: string | number | boolean | null };

export function partsOf(v: ReqValue | Record<string, unknown>): Part[] {
  if (v === null || typeof v !== "object") return [{ key: "", value: v }];
  return Object.entries(v)
    .filter(([k, x]) => k !== "any_of" && (x === null || typeof x !== "object"))
    .map(([k, x]) => ({ key: k, value: x as Part["value"] }));
}

// A field that is a percentage gets a "%" after its number (success_rate 80 → "80%"); every other number is printed as it came.
export const isPercentKey = (key: string): boolean => /(^|_)(percent|percentage)$|^success_rate$/.test(key);
