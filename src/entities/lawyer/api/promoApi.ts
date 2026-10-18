import { http } from "@/shared/api";
import { listFrom } from "@/shared/lib/json";
import { hasPromoTarget, normPromo } from "./normPromo";
import type { PromoSurface } from "../model/marketTypes";

// GET /promotions/active — banners and boosted profiles/services running right now (read-only).
export async function listActivePromos(limit = 6): Promise<PromoSurface[]> {
  const data = await http(`/promotions/active?limit=${limit}`);
  return listFrom(data, "items", "data", "promotions").map(normPromo).filter(hasPromoTarget);
}
