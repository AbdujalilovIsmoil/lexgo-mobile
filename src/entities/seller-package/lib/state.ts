import type { PackageFilter, PackageState, SellerPackage } from "../model/types";

export const TARIFF_ORDER = ["BASIC", "STANDARD", "PREMIUM"];
export const FILTERS: PackageFilter[] = ["all", "active", "available", "blocked"];

// enabled + active -> active, enabled + disabled -> paused, never enabled -> available if eligible else blocked.
export const stateOf = (p: SellerPackage): PackageState => (p.enabled ? (p.status === "active" ? "active" : "paused") : p.eligibility.eligible ? "available" : "blocked");

// "active" also covers paused rows (the web counts them as enabled).
export const matchesFilter = (s: PackageState, f: PackageFilter): boolean => f === "all" || (f === "active" ? s === "active" || s === "paused" : s === f);

export function countStates(items: SellerPackage[]): Record<PackageFilter, number> {
  const n: Record<PackageFilter, number> = { all: items.length, active: 0, available: 0, blocked: 0 };
  for (const p of items) {
    const s = stateOf(p);
    if (s === "active" || s === "paused") n.active++;
    else n[s]++;
  }
  return n;
}

export function matchesSearch(p: SellerPackage, q: string): boolean {
  const n = q.trim().toLowerCase();
  return !n || `${p.pkg.title} ${p.pkg.category} ${p.pkg.code}`.toLowerCase().includes(n);
}

export type PackageGroupRows = { code: string; title: string; category: string; rows: SellerPackage[] };

// Filter + search, then one group per package code with its tariffs in BASIC, STANDARD, PREMIUM order.
export function groupRows(items: SellerPackage[], filter: PackageFilter, q: string): PackageGroupRows[] {
  const map = new Map<string, PackageGroupRows>();
  for (const p of items) {
    if (!matchesFilter(stateOf(p), filter) || !matchesSearch(p, q)) continue;
    const code = p.pkg.groupCode || p.pkg.code || p.id;
    const g = map.get(code) ?? { code, title: p.pkg.groupTitle || p.pkg.title, category: p.pkg.category, rows: [] };
    g.rows.push(p);
    map.set(code, g);
  }
  const groups = [...map.values()];
  for (const g of groups) g.rows.sort((a, b) => TARIFF_ORDER.indexOf(a.pkg.tariff) - TARIFF_ORDER.indexOf(b.pkg.tariff));
  return groups;
}

// Known backend reason codes have a translation; an unknown code is shown readable.
export const KNOWN_REASONS = ["extended_verification_required", "base_verification_required", "required_services_disabled", "provider_tier_mismatch", "package_seller_profile_missing"];
export const reasonKey = (code: string): string | null => (KNOWN_REASONS.includes(code) ? `pkgSeller.reasons.${code}` : null);
export const readable = (code: string): string => code.replace(/_/g, " ");
