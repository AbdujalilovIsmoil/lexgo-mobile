import { http } from "@/shared/api";
import { asDict, asStr, listFrom, uzs } from "@/shared/lib/json";
import type { Ad, AdInput } from "../model/types";

export function normAd(v: unknown): Ad {
  const d = asDict(v);
  const payload = asDict(d.payload);
  return {
    id: asStr(d.id),
    workId: asStr(d.work_id),
    recordType: asStr(d.record_type),
    title: asStr(d.title),
    status: asStr(d.status),
    price: uzs(d, "price"),
    currency: asStr(d.currency, "UZS"),
    payload,
    description: asStr(payload.description),
    createdAt: asStr(d.created_at),
  };
}

// GET /ads/products — all ad products, deleted ones included (status "deleted").
export async function listAds(): Promise<Ad[]> {
  return listFrom(await http("/ads/products"), "items", "data").map(normAd);
}

// POST /ads/products — a new ad product (record type empty, status active, currency UZS).
export async function createAd(b: AdInput): Promise<void> {
  await http("/ads/products", { method: "POST", body: { record_type: "", status: "active", currency: "UZS", ...b } });
}

// PATCH /ads/products/{id} — partial update (the payload is replaced, so callers merge it).
export async function updateAd(id: string, b: Partial<AdInput>): Promise<void> {
  await http(`/ads/products/${encodeURIComponent(id)}`, { method: "PATCH", body: b });
}

// DELETE /ads/products/{id} — soft delete (status → "deleted").
export async function deleteAd(id: string): Promise<void> {
  await http(`/ads/products/${encodeURIComponent(id)}`, { method: "DELETE" });
}
