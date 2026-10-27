import { asDict, asNum, asStr } from "@/shared/lib/json";
import type { FeatureMode, FeatureTerm } from "../model/features";

export const numOrNull = (v: unknown): number | null => (v === null || v === undefined || v === "" ? null : Number.isFinite(asNum(v, NaN)) ? asNum(v) : null);

// The backend's mode word. A limited feature with a zero limit, or one the backend marks as not allowed without a counter, is locked.
export function modeOf(raw: unknown, limit: number | null, allowed?: unknown): FeatureMode {
  const m = asStr(raw).toLowerCase();
  if (m === "unavailable" || m === "disabled") return "unavailable";
  if (m === "unlimited") return allowed === false ? "unavailable" : "unlimited";
  if (limit === 0) return "unavailable";
  if (m === "limited") return "limited";
  return allowed === false && limit === null ? "unavailable" : "limited";
}

function row(key: string, v: unknown): FeatureTerm {
  const r = asDict(v);
  const limit = numOrNull(r.limit);
  return { key, mode: modeOf(r.mode, limit, r.enabled ?? r.allowed), limit, unit: asStr(r.unit), resetPeriod: asStr(r.reset_period) };
}

// Rows of an entitlement contract — the catalogue's `entitlement_contract`, a snapshot's `entitlements` — or the older { key: value } map of a
// plan (true = unlimited, a positive number = that limit, false / 0 = locked).
export function normTerms(v: unknown): FeatureTerm[] {
  if (Array.isArray(v)) return v.map((x) => row(asStr(asDict(x).feature_key ?? asDict(x).key), x)).filter((t) => t.key);
  return Object.entries(asDict(v)).map(([key, val]): FeatureTerm => {
    if (typeof val === "boolean") return { key, mode: val ? "unlimited" : "unavailable", limit: null, unit: "", resetPeriod: "" };
    if (typeof val === "string" && !Number.isFinite(Number(val))) return { key, mode: modeOf(val, null), limit: null, unit: "", resetPeriod: "" };
    const n = numOrNull(val);
    return n === null ? row(key, val) : { key, mode: n > 0 ? "limited" : "unavailable", limit: n, unit: "", resetPeriod: "" };
  });
}

// The 402 contract names `document_constructor` and `ai_document_analysis`, while the published tariffs still list those features under
// their older keys. A lookup tries the key first, then the older one, so a gate finds the plans that give it until the tariffs are
// re-published with the new keys.
const OLDER: Record<string, string[]> = { ai_document_analysis: ["doc_analysis"], document_constructor: ["manual_document_fill"] };
export const featureKeysOf = (key: string): string[] => [key, ...(OLDER[key] ?? [])];

export function findByKey<T extends { key: string }>(list: readonly T[], key: string): T | undefined {
  for (const k of featureKeysOf(key)) {
    const hit = list.find((x) => x.key === k);
    if (hit) return hit;
  }
  return undefined;
}
