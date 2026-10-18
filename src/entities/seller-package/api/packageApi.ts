import { http } from "@/shared/api";
import { listFrom } from "@/shared/lib/json";
import { normPackage } from "./normalize";
import type { SellerPackage } from "../model/types";

const enc = encodeURIComponent;

// GET /lawyers/me/packages/manage - every active Studio package with enabled / status / price_editable=false / eligibility.
export const listPackages = async (): Promise<SellerPackage[]> => listFrom(await http("/lawyers/me/packages/manage"), "items", "packages", "data").map(normPackage).filter((p) => p.id);

// POST …/{id}/enable - the seller opts in (TZ 5.2).
export const enablePackage = (id: string) => http(`/lawyers/me/packages/${enc(id)}/enable`, { method: "POST" });

// PATCH …/{id}/status - switch an already selected package on / off. No price or content is ever sent.
export const setPackageStatus = (id: string, status: "active" | "disabled") => http(`/lawyers/me/packages/${enc(id)}/status`, { method: "PATCH", body: { status } });
