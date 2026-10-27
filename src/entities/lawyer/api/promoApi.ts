import { http } from "@/shared/api";
import { listFrom } from "@/shared/lib/json";
import { hasPromoTarget, normPromo } from "./normPromo";
import type { PromoSurface } from "../model/marketTypes";

export type ActivePromoQuery = { placement?: "banner" | "profile_boost" | "service_boost"; sellerUserId?: string; limit?: number };

// GET /promotions/active — what runs right now (public, read-only): the top banners (placement=banner) or one seller's promotions
// (seller_user_id). A banner picture is served by the backend only while its promotion runs.
export async function listActivePromos({ placement, sellerUserId, limit = 10 }: ActivePromoQuery = {}): Promise<PromoSurface[]> {
  const q = new URLSearchParams({ limit: String(limit) });
  if (placement) q.set("placement", placement);
  if (sellerUserId) q.set("seller_user_id", sellerUserId);
  return listFrom(await http(`/promotions/active?${q}`), "items", "data", "promotions").map(normPromo).filter(hasPromoTarget);
}
