import type { PriceBand, ProService, ServiceScope } from "../model/types";

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
