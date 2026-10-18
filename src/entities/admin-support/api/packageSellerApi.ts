import { http } from "@/shared/api";
import { asArr, asDict } from "@/shared/lib/json";
import type { Seller } from "../model/lookupTypes";
import { normSeller } from "./sellerApi";

// GET /service-packages/{id}/eligible-sellers - only sellers who enabled the package; the backend order is kept.
export async function listEligibleSellers(packageId: string): Promise<Seller[]> {
  const data = asDict(await http(`/service-packages/${encodeURIComponent(packageId)}/eligible-sellers?limit=30&offset=0`));
  return asArr(data.items).map(asDict).filter((d) => d.user_id ?? d.id).map(normSeller);
}
