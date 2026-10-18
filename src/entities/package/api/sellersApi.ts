import { http } from "@/shared/api";
import { asArr, asDict, asNum, asStr } from "@/shared/lib/json";
import type { PackageSeller, SellerPage } from "../model/sellerTypes";

export const SELLERS_PAGE = 30;

export function normSeller(v: unknown): PackageSeller {
  const d = asDict(v);
  const el = asDict(d.package_eligibility);
  return {
    userId: asStr(d.user_id),
    name: asStr(d.display_name || d.name || d.lawyer_name),
    publicId: asStr(d.public_id),
    rating: asNum(d.rating),
    reviews: asNum(d.reviews_count),
    completed: asNum(d.completed_orders),
    trust: asNum(d.trust_score),
    online: d.online_now === true,
    verified: d.lexgo_verified === true || el.extended_verified === true,
    badge: asStr(asDict(d.verification_badge).label),
    eligible: el.eligible !== false,
    reasons: asArr(el.reasons).map((x) => asStr(x)).filter(Boolean),
    providerTier: asStr(el.provider_tier),
    purchaseUrl: asStr(d.package_purchase_url),
  };
}

// GET /service-packages/{id}/eligible-sellers?limit&offset — only sellers that enabled this package.
export async function listEligibleSellers(packageId: string, offset: number): Promise<SellerPage> {
  const d = asDict(await http(`/service-packages/${encodeURIComponent(packageId)}/eligible-sellers?limit=${SELLERS_PAGE}&offset=${offset}`));
  const policy: Record<string, string> = {};
  for (const [k, v] of Object.entries(asDict(d.matching_policy))) policy[k] = asStr(v);
  const items = asArr(d.items).map(normSeller).filter((x) => x.userId && x.purchaseUrl);
  return { items, hasMore: d.has_more === true, offset: offset + SELLERS_PAGE, policy };
}
