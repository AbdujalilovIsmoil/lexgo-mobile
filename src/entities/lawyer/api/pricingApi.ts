import { getPolicies } from "@/shared/api";
import { asArr, asDict, asNum } from "@/shared/lib/json";

export type PricingPolicy = {
  minPercent: number;
  maxPercent: number;
  experience: { min: number; max: number; percent: number }[];
  regions: { key: string; coef: number }[];
  clientRating: { rating: number; reviews: number; percent: number };
  seller: { percent: number };
  sector: { years: number; percent: number };
};

// GET /platform/policies → items.marketplace_pricing: the public rules the
// backend applies to a seller's price (read-only; admins edit them on the web).
export async function getPricingPolicy(): Promise<PricingPolicy | null> {
  const p = asDict((await getPolicies()).marketplace_pricing);
  if (!Object.keys(p).length) return null;
  const client = asDict(p.client_rating_premium);
  return {
    minPercent: asNum(p.default_min_percent, 70),
    maxPercent: asNum(p.default_max_percent, 100),
    experience: asArr(p.experience_multipliers).map((x) => ({ min: asNum(asDict(x).min_years), max: asNum(asDict(x).max_years, 99), percent: asNum(asDict(x).percent) })),
    regions: Object.entries(asDict(p.region_multipliers)).map(([key, v]) => ({ key, coef: asNum(v, 1) })),
    clientRating: { rating: asNum(client.rating_min), reviews: asNum(client.reviews_min), percent: asNum(client.percent) },
    seller: { percent: asNum(asDict(p.seller_premium).percent) },
    sector: { years: asNum(asDict(p.sector_experience_premium).min_years), percent: asNum(asDict(p.sector_experience_premium).percent) },
  };
}
