import { http } from "@/shared/api";
import { asDict, uzs } from "@/shared/lib/json";
import { normBand, normModifiers } from "./normBand";
import type { PriceBand } from "../model/types";

// GET /pricing/quote for this seller → the corridor for a service not added yet: the server's own pricing_limits only, completed
// with the quote's total, base price and factors. Without limits the corridor stays unknown and the server checks the price on
// save (its 422 carries the limits) — no local formula.
export async function quoteBand(serviceId: string, sellerId: string, region: string): Promise<PriceBand | null> {
  const qs = new URLSearchParams({ service_id: serviceId, apply_referral: "false", region });
  if (sellerId) qs.set("seller_user_id", sellerId);
  const q = asDict(await http(`/pricing/quote?${qs}`));
  const lim = asDict(q.pricing_limits);
  const band = normBand(lim);
  if (!band) return null;
  return {
    ...band,
    recommended: uzs(lim, "recommended_price", "recommended") || uzs(q, "total_amount") || band.recommended,
    base: band.base ?? (uzs(q, "base_amount", "base_price") || null),
    modifiers: band.modifiers ?? (Array.isArray(q.modifiers) ? normModifiers(q.modifiers) : null),
  };
}
