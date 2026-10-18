import type { PillTone } from "@/shared/ui";
import type { Ad } from "../model/types";

const COLOR: Record<string, string> = { active: "#22C55E", approved: "#22C55E", paused: "#F59E0B", pending: "#F59E0B", draft: "#94A3B8", expired: "#EF4444", rejected: "#EF4444", deleted: "#64748B" };
const TONE: Record<string, PillTone> = { active: "ok", approved: "ok", paused: "warn", pending: "warn", draft: "gray", expired: "err", rejected: "err", deleted: "gray" };

// Strip colour and pill tone of an ad status (unknown free-text statuses read as neutral blue).
export const adColor = (s: string): string => COLOR[s] ?? "#1668F0";
export const adTone = (s: string): PillTone => TONE[s] ?? "blue";

// Translated status / record type, falling back to the raw backend text.
export function adLabel(t: (k: string) => string, group: "status" | "types", v: string): string {
  const key = `admAds.${group}.${v}`;
  return t(key) === key ? v : t(key);
}

// Statuses that really occur in the list, known ones first.
export function usedStatuses(ads: Ad[]): string[] {
  return [...new Set(ads.map((a) => a.status).filter(Boolean))];
}
