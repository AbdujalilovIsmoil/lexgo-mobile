import type { SoOptions, SoSelection } from "../model/types";

export const clampCount = (n: number, o: Pick<SoOptions, "minCount" | "maxCount">): number => Math.min(o.maxCount, Math.max(o.minCount, Math.round(n) || o.minCount));

// A price may be asked for only once a channel is chosen and the lawyer count is inside the backend's range; directions are optional.
export const canQuote = (s: SoSelection, o: Pick<SoOptions, "minCount" | "maxCount">): boolean =>
  !!s.channel && Number.isInteger(s.count) && s.count >= o.minCount && s.count <= o.maxCount;

const same = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

export function toggleDirection(list: string[], name: string): string[] {
  return list.some((x) => same(x, name)) ? list.filter((x) => !same(x, name)) : [...list, name.trim()];
}

// A direction typed by the client: trimmed, no empties, no duplicates (case-insensitive).
export function addDirection(list: string[], text: string): string[] {
  const v = text.trim().replace(/\s{2,}/g, " ");
  return !v || list.some((x) => same(x, v)) ? list : [...list, v];
}
