import { http } from "@/shared/api";
import { asArr, asDict } from "@/shared/lib/json";
import { normPackage } from "./normalize";
import type { SellerPackage } from "../model/types";

const enc = encodeURIComponent;

// GET /lawyers/me/packages/manage - every Studio package tariff with enabled / status / eligibility.
export async function listPackages(): Promise<SellerPackage[]> {
  const data = await http("/lawyers/me/packages/manage");
  const rows = Array.isArray(data) ? data : asArr(asDict(data).items ?? asDict(data).packages ?? asDict(data).data);
  return rows.map(normPackage).filter((p) => p.id);
}

// POST …/{id}/enable - the seller opts in to this tariff.
export const enablePackage = (id: string) => http(`/lawyers/me/packages/${enc(id)}/enable`, { method: "POST" });

// PATCH …/{id}/status - pause ("disabled") or resume ("active"). No price or content is ever sent.
export const setPackageStatus = (id: string, status: "active" | "disabled") => http(`/lawyers/me/packages/${enc(id)}/status`, { method: "PATCH", body: { status } });
