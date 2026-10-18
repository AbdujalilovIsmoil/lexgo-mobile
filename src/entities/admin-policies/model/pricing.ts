import { asDict, asNum, asStr, type Dict } from "@/shared/lib/json";
import { isPlain } from "./json";

export type Tier = { minYears: number; maxYears: number; percent: number };
export type RegionCoef = { key: string; coef: number };
export type Seller = { successRateMin: number; totalCasesMin: number; winsMin: number; ratingMin: number; reviewsMin: number; percent: number };
export type Client = { ratingMin: number; reviewsMin: number; percent: number };
export type Sector = { verifiedOnly: boolean; minYears: number; percent: number };
export type Pricing = { minPercent: number; maxPercent: number; experience: Tier[]; regions: RegionCoef[]; seller: Seller; client: Client; sector: Sector };

export const SELLER_FIELDS = ["successRateMin", "totalCasesMin", "winsMin", "ratingMin", "reviewsMin", "percent"] as const;
export const CLIENT_FIELDS = ["ratingMin", "reviewsMin", "percent"] as const;

export const DEFAULT_PRICING: Pricing = {
  minPercent: 70,
  maxPercent: 100,
  experience: [{ minYears: 0, maxYears: 2, percent: 0 }, { minYears: 3, maxYears: 5, percent: 10 }, { minYears: 6, maxYears: 10, percent: 15 }, { minYears: 11, maxYears: 99, percent: 20 }],
  regions: [{ key: "default", coef: 1 }, { key: "toshkent", coef: 1.15 }, { key: "tashkent", coef: 1.15 }, { key: "samarqand", coef: 1.05 }, { key: "samarkand", coef: 1.05 }, { key: "remote", coef: 0.9 }],
  seller: { successRateMin: 85, totalCasesMin: 20, winsMin: 50, ratingMin: 5, reviewsMin: 20, percent: 20 },
  client: { ratingMin: 4.8, reviewsMin: 10, percent: 10 },
  sector: { verifiedOnly: true, minYears: 5, percent: 30 },
};

export const normRegionKey = (k: string) => k.trim().toLowerCase().replace(/\s+/g, " ");
export const clonePricing = (p: Pricing): Pricing => JSON.parse(JSON.stringify(p)) as Pricing;

// The stored section → editable numbers. Missing fields fall back to the defaults; an empty section is null.
export function readPricing(raw: unknown): Pricing | null {
  if (!isPlain(raw) || !Object.keys(raw).length) return null;
  const D = DEFAULT_PRICING;
  const n = (d: Dict, k: string, fb: number) => asNum(d[k], fb);
  const exp = Array.isArray(raw.experience_multipliers) ? raw.experience_multipliers.map(asDict).map((r) => ({ minYears: n(r, "min_years", NaN), maxYears: n(r, "max_years", 99), percent: n(r, "percent", NaN) })).filter((r) => !Number.isNaN(r.minYears) && !Number.isNaN(r.percent)) : D.experience;
  const reg = isPlain(raw.region_multipliers) ? Object.entries(raw.region_multipliers).map(([k, c]) => ({ key: normRegionKey(k), coef: asNum(c, NaN) })).filter((r) => r.key && !Number.isNaN(r.coef)) : D.regions;
  const s = asDict(raw.seller_premium);
  const c = asDict(raw.client_rating_premium);
  const x = asDict(raw.sector_experience_premium);
  return {
    minPercent: n(raw, "default_min_percent", D.minPercent),
    maxPercent: n(raw, "default_max_percent", D.maxPercent),
    experience: exp.map((t) => ({ ...t })),
    regions: reg.map((r) => ({ ...r })),
    seller: { successRateMin: n(s, "success_rate_min", D.seller.successRateMin), totalCasesMin: n(s, "total_cases_min", D.seller.totalCasesMin), winsMin: n(s, "wins_min", D.seller.winsMin), ratingMin: n(s, "rating_min", D.seller.ratingMin), reviewsMin: n(s, "reviews_min", D.seller.reviewsMin), percent: n(s, "percent", D.seller.percent) },
    client: { ratingMin: n(c, "rating_min", D.client.ratingMin), reviewsMin: n(c, "reviews_min", D.client.reviewsMin), percent: n(c, "percent", D.client.percent) },
    sector: { verifiedOnly: x.verified_only === undefined ? D.sector.verifiedOnly : x.verified_only === true || asStr(x.verified_only) === "true", minYears: n(x, "min_years", D.sector.minYears), percent: n(x, "percent", D.sector.percent) },
  };
}

// Editable numbers → the section body. Unknown fields of the stored section (`base`) are kept as they were.
export function pricingBody(p: Pricing, base: Dict = {}): Dict {
  const keep = (v: unknown): Dict => (isPlain(v) ? v : {});
  return {
    ...base,
    default_min_percent: p.minPercent,
    default_max_percent: p.maxPercent,
    experience_multipliers: p.experience.map((t) => ({ min_years: t.minYears, max_years: t.maxYears, percent: t.percent })),
    region_multipliers: Object.fromEntries(p.regions.map((r) => [normRegionKey(r.key), r.coef])),
    seller_premium: { ...keep(base.seller_premium), success_rate_min: p.seller.successRateMin, total_cases_min: p.seller.totalCasesMin, wins_min: p.seller.winsMin, rating_min: p.seller.ratingMin, reviews_min: p.seller.reviewsMin, percent: p.seller.percent },
    client_rating_premium: { ...keep(base.client_rating_premium), rating_min: p.client.ratingMin, reviews_min: p.client.reviewsMin, percent: p.client.percent },
    sector_experience_premium: { ...keep(base.sector_experience_premium), verified_only: p.sector.verifiedOnly, min_years: p.sector.minYears, percent: p.sector.percent },
  };
}
