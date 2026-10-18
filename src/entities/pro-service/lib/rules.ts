import type { PriceBand, ProService, ServiceFilter, ServiceScope } from "../model/types";

export const scopeKey = (s: ServiceScope) => (s.kind === "org" ? `org:${s.orgId}:${s.memberId}` : "me");

// Catalogue prefixes only an advocate may sell (a yurist is refused by the server).
const ADVOCATE_PREFIX = ["criminal-", "administrative-"];
export const isAdvocateOnly = (s: { advokatRequired: boolean; name: string }, slug = ""): boolean =>
  s.advokatRequired || ADVOCATE_PREFIX.some((p) => slug.toLowerCase().startsWith(p));

export type PriceIssue = "low" | "high" | null;

// TZ 5.1: a seller may go LOWER than the corridor but never above the backend maximum; 0 = "use the catalogue price".
// A price under the recommended one is never blocked here - the server alone rejects what it does not accept.
export function priceIssue(price: number, band: PriceBand | null): PriceIssue {
  return band && price > 0 && band.max > 0 && price > band.max ? "high" : null;
}

export const bandRecommended = (b: PriceBand): number => (b.recommended >= b.min && b.recommended <= b.max ? b.recommended : b.max);

export type HiddenReason = "catalogOff" | "paused" | "inactive" | "noPrice" | "unverified" | "other";

// Why an active-looking service is not shown to clients (TZ 31: pending sellers do not sell).
export function hiddenReasons(item: ProService, verified: boolean): HiddenReason[] {
  if (item.visible) return [];
  const out: HiddenReason[] = [];
  if (!item.catalogActive) out.push("catalogOff");
  if (item.status === "paused") out.push("paused");
  if (item.status === "inactive") out.push("inactive");
  if (!item.effectivePrice) out.push("noPrice");
  if (!verified) out.push("unverified");
  return out.length ? out : ["other"];
}

export const countBy = (items: ProService[]) => ({
  all: items.length,
  active: items.filter((x) => x.status === "active").length,
  paused: items.filter((x) => x.status === "paused").length,
  inactive: items.filter((x) => x.status === "inactive").length,
  promoted: items.filter((x) => x.promotion).length,
});

// Is the price the seller typed above what the server lets us charge? (the client then pays the capped price)
export const isCapped = (item: ProService): boolean => item.priceCapped || (item.selectedPrice > 0 && !!item.limits && item.limits.max > 0 && item.selectedPrice > item.limits.max);

export type BandLine = "ok" | "off" | "none" | "unknown";

// Which corridor line a card shows: the range, the range with a warning (own price above it), "no catalogue price", or "checked on save".
export function bandLine(item: ProService): BandLine {
  if (!item.limits) return !item.catalogPrice && !item.effectivePrice ? "none" : "unknown";
  return item.selectedPrice > item.limits.max ? "off" : "ok";
}

// Catalogue-inactive services cannot be edited; only an active, unpromoted service with nothing pending can be promoted.
export const canEdit = (item: ProService): boolean => item.catalogActive;
export const canPromote = (item: ProService, waiting: boolean): boolean => item.status === "active" && item.catalogActive && !item.promotion && !waiting;

const RANK: Record<ProService["status"], number> = { active: 0, paused: 1, inactive: 2 };

// The list the screen shows: status filter + free-text search, active first then by name.
export function filterServices(items: ProService[], filter: ServiceFilter, search: string): ProService[] {
  const term = search.trim().toLowerCase();
  return items
    .filter((x) => (filter === "all" || x.status === filter) && (!term || `${x.name} ${x.categoryTitle} ${x.subcategory} ${x.note}`.toLowerCase().includes(term)))
    .sort((a, b) => RANK[a.status] - RANK[b.status] || a.name.localeCompare(b.name));
}

export type CheckKey = "active" | "catalog" | "price" | "verified";
export type Check = { key: CheckKey; ok: boolean };

// The four conditions for a service to be listed in the marketplace, each met or not (the sheet shows them as a checklist).
export function visibilityChecks(item: ProService, verified: boolean): Check[] {
  return [
    { key: "active", ok: item.status === "active" },
    { key: "catalog", ok: item.catalogActive },
    { key: "price", ok: item.effectivePrice > 0 },
    { key: "verified", ok: verified },
  ];
}

export type Gauge = { min: number; max: number; recommended: number | null; value: number; at: number; over: boolean };

// Where the price in use sits inside the allowed corridor (0..1 along the bar); null while the server gave no corridor.
export function priceGauge(item: ProService): Gauge | null {
  const l = item.limits;
  if (!l || l.max <= 0 || l.max <= l.min) return null;
  const value = item.effectivePrice || item.selectedPrice;
  const clamp = (n: number) => Math.min(1, Math.max(0, n));
  const rec = l.recommended > 0 && l.recommended >= l.min && l.recommended <= l.max ? l.recommended : null;
  return { min: l.min, max: l.max, recommended: rec, value, at: clamp((value - l.min) / (l.max - l.min)), over: value > l.max };
}
