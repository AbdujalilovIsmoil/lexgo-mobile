import { getPolicies, http } from "@/shared/api";
import { asDict, asNum, asStr, uzs } from "@/shared/lib/json";
import { normModifiers } from "./normBand";
import type { PriceBand } from "../model/types";

// Platform corridor (percent of the recommended price); 70–100 unless admins changed it.
export async function getPercents(): Promise<{ min: number; max: number }> {
  try {
    const raw = asDict((await getPolicies()).marketplace_pricing);
    const min = asNum(raw.default_min_percent, 70);
    const max = asNum(raw.default_max_percent, 100);
    return min > 0 && min <= max ? { min, max } : { min: 70, max: 100 };
  } catch {
    return { min: 70, max: 100 };
  }
}

// GET /pricing/quote for this seller → the corridor for a service not added yet.
// The server's own limits win; the percent corridor is the fallback (law-main fetchPriceBand).
export async function quoteBand(serviceId: string, sellerId: string, region: string): Promise<PriceBand | null> {
  const qs = new URLSearchParams({ service_id: serviceId, apply_referral: "false", region });
  if (sellerId) qs.set("seller_user_id", sellerId);
  const [raw, pct] = await Promise.all([http(`/pricing/quote?${qs}`), getPercents()]);
  const q = asDict(raw);
  const total = uzs(q, "total_amount");
  if (!total) return null;
  const lim = asDict(q.pricing_limits);
  const maxL = lim.max_allowed != null ? uzs(lim, "max_allowed") : 0;
  return {
    recommended: uzs(lim, "recommended_price", "recommended") || total,
    min: lim.min_allowed != null ? uzs(lim, "min_allowed") : Math.floor((total * pct.min) / 100),
    max: maxL || Math.floor((total * pct.max) / 100),
    base: uzs(q, "base_amount", "base_price") || null,
    currency: asStr(q.currency) || "UZS",
    modifiers: Array.isArray(q.modifiers) ? normModifiers(q.modifiers) : null,
  };
}
