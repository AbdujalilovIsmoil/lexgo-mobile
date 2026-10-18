import { http } from "@/shared/api";
import { asArr, asDict, asNum, asStr, uzs, type Dict } from "@/shared/lib/json";
import type { Seller, SellerService } from "../model/lookupTypes";
import { cleanTitle } from "./dict";

const normService = (v: unknown): SellerService => {
  const d = asDict(v);
  const sel = uzs(d, "selected_price");
  return { id: asStr(d.id ?? d.service_id), title: cleanTitle(d.title ?? d.name), categoryTitle: asStr(d.category_title), price: sel || uzs(d, "base_price"), currency: asStr(d.currency, "UZS") || "UZS" };
};

const verified = (d: Dict) => {
  const badge = asDict(d.verification_badge);
  return Object.keys(badge).length ? badge.visible === true : (d.lexgo_verified ?? d.is_verified ?? d.verified) === true;
};

// GET /marketplace/lawyers — only LexGo-verified sellers may receive an operator's request.
export async function searchSellers(q: string): Promise<Seller[]> {
  const qs = new URLSearchParams({ limit: "40", q: q.trim().slice(0, 120) });
  return asArr(asDict(await http(`/marketplace/lawyers?${qs}`)).items)
    .map(asDict)
    .filter((d) => asStr(d.user_id ?? d.id) && verified(d))
    .map(normSeller);
}

export function normSeller(d: Dict): Seller {
  const services = asArr(d.services).map(normService).filter((s) => s.id);
  const prices = services.map((s) => s.price).filter((p) => p > 0);
  return { userId: asStr(d.user_id ?? d.id), name: asStr(d.lawyer_name ?? d.name).trim(), sellerType: asStr(d.seller_type).toLowerCase(), rating: asNum(d.rating), servicesCount: asNum(d.services_count, services.length), priceFrom: uzs(d, "price_from") || (prices.length ? Math.min(...prices) : 0), services, packageId: asStr(d.package_id) };
}

export async function getSellerServices(userId: string): Promise<SellerService[]> {
  const d = asDict(await http(`/marketplace/lawyers/${encodeURIComponent(userId)}/services`));
  return asArr(d.items).map(normService).filter((s) => s.id);
}
