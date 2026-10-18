import { TIERS, type CatalogEntry, type ServicePackage } from "../model/types";

// Seed/test packages the backend team left in the catalogue (hidden, like the web).
export const isTestPackage = (p: ServicePackage) => /test|t1b/i.test(p.code) || /test/i.test(p.title);
export const codeCount = (list: ServicePackage[]) => new Set(list.map((p) => p.code)).size;

// "G01-G03" → ["G01","G02","G03"]; "G01, G04" → both.
export function codesOf(p: ServicePackage): string[] {
  const out: string[] = [];
  for (const part of (p.relatedServiceCodes || "").split(/[,;]/)) {
    const m = /^\s*([A-Z]+)(\d+)\s*-\s*(?:[A-Z]+)?(\d+)\s*$/i.exec(part);
    if (m) for (let i = Number(m[2]); i <= Number(m[3]); i++) out.push(`${m[1].toUpperCase()}${String(i).padStart(m[2].length, "0")}`);
    else if (part.trim()) out.push(part.trim().toUpperCase());
  }
  return out;
}

// What the services cost bought one by one (0 when any of them has no price).
export function separatelyPrice(p: ServicePackage, byCode: Map<string, CatalogEntry>): number {
  const prices = codesOf(p).map((c) => byCode.get(c)?.price ?? 0);
  return prices.length && prices.every((x) => x > 0) ? prices.reduce((a, b) => a + b, 0) : 0;
}

export const firstService = (p: ServicePackage, byCode: Map<string, CatalogEntry>) => codesOf(p).map((c) => byCode.get(c)).find(Boolean);

// One row per package code, tariffs in BASIC → PREMIUM order.
export function groupPackages(list: ServicePackage[], cat: string): [string, ServicePackage[]][] {
  const m = new Map<string, ServicePackage[]>();
  for (const p of list) {
    if (cat && p.categoryTitle !== cat) continue;
    m.set(p.code, [...(m.get(p.code) ?? []), p]);
  }
  const rank = (p: ServicePackage) => TIERS.indexOf(p.tariff as (typeof TIERS)[number]);
  for (const v of m.values()) v.sort((a, b) => rank(a) - rank(b));
  return [...m.entries()].sort((a, b) => a[0].localeCompare(b[0]));
}
