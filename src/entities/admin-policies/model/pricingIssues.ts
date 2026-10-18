import { CLIENT_FIELDS, normRegionKey, SELLER_FIELDS, type Pricing } from "./pricing";

export type IssueCode = "required" | "range" | "int" | "minMax" | "rowMinMax" | "order" | "overlap" | "gap" | "duplicate" | "defaultMissing" | "emptyKey";
export type Issue = { path: string; code: IssueCode; warn: boolean; params: Record<string, string | number> };
type Bound = { min: number; max: number; int?: boolean };

const B = { minPercent: { min: 1, max: 100 }, maxPercent: { min: 1, max: 500 }, years: { min: 0, max: 100, int: true }, percent: { min: 0, max: 300 }, coef: { min: 0.1, max: 5 }, share: { min: 0, max: 100 }, count: { min: 0, max: 100000, int: true }, rating: { min: 0, max: 5 } };
const SELLER: Record<(typeof SELLER_FIELDS)[number], Bound> = { successRateMin: B.share, totalCasesMin: B.count, winsMin: B.count, ratingMin: B.rating, reviewsMin: B.count, percent: B.percent };
const CLIENT: Record<(typeof CLIENT_FIELDS)[number], Bound> = { ratingMin: B.rating, reviewsMin: B.count, percent: B.percent };

// Client-side checks that mirror the backend's rules: ranges, whole numbers, tiers that do not
// overlap, one "default" region. `warn` issues (uncovered years) do not block saving.
export function pricingIssues(p: Pricing): Issue[] {
  const out: Issue[] = [];
  const add = (path: string, code: IssueCode, params: Issue["params"] = {}, warn = false) => out.push({ path, code, warn, params });
  const check = (path: string, v: number, b: Bound): boolean => {
    if (!Number.isFinite(v)) add(path, "required");
    else if (v < b.min || v > b.max) add(path, "range", { min: b.min, max: b.max });
    else if (b.int && !Number.isInteger(v)) add(path, "int");
    else return true;
    return false;
  };
  const okMin = check("minPercent", p.minPercent, B.minPercent);
  const okMax = check("maxPercent", p.maxPercent, B.maxPercent);
  if (okMin && okMax && p.minPercent > p.maxPercent) add("maxPercent", "minMax");
  const tiers = p.experience.map((t, i) => {
    const a = check(`exp.${i}.minYears`, t.minYears, B.years);
    const b = check(`exp.${i}.maxYears`, t.maxYears, B.years);
    check(`exp.${i}.percent`, t.percent, B.percent);
    if (a && b && t.minYears > t.maxYears) add(`exp.${i}.maxYears`, "rowMinMax", { row: i + 1 });
    return { ...t, i, ok: a && b && t.minYears <= t.maxYears };
  }).filter((t) => t.ok);
  const sorted = [...tiers].sort((a, b) => a.minYears - b.minYears || a.maxYears - b.maxYears);
  if (tiers.some((t, k) => k > 0 && tiers[k - 1].minYears > t.minYears)) add("exp", "order");
  if (sorted.length && sorted[0].minYears > 0) add("exp", "gap", { from: 0, to: sorted[0].minYears - 1 }, true);
  for (let k = 1; k < sorted.length; k++) {
    const a = sorted[k - 1];
    const b = sorted[k];
    if (b.minYears <= a.maxYears) add(`exp.${b.i}.minYears`, "overlap", { a: Math.min(a.i, b.i) + 1, b: Math.max(a.i, b.i) + 1 });
    else if (b.minYears > a.maxYears + 1) add("exp", "gap", { from: a.maxYears + 1, to: b.minYears - 1 }, true);
  }
  const seen = new Set<string>();
  p.regions.forEach((r, i) => {
    const key = normRegionKey(r.key);
    if (!key) add(`regions.${i}.key`, "emptyKey", { row: i + 1 });
    else if (seen.has(key)) add(`regions.${i}.key`, "duplicate", { key });
    else seen.add(key);
    check(`regions.${i}.coef`, r.coef, B.coef);
  });
  if (!seen.has("default")) add("regions", "defaultMissing");
  SELLER_FIELDS.forEach((f) => check(`seller.${f}`, p.seller[f], SELLER[f]));
  CLIENT_FIELDS.forEach((f) => check(`client.${f}`, p.client[f], CLIENT[f]));
  check("sector.minYears", p.sector.minYears, B.years);
  check("sector.percent", p.sector.percent, B.percent);
  return out;
}
