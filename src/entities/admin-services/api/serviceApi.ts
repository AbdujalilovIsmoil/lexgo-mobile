import { http } from "@/shared/api";
import { asDict, asNum, asStr, listFrom, type Dict } from "@/shared/lib/json";
import { cleanTitle } from "../lib/title";
import type { AdminService, ServiceCreate, ServiceUpdate } from "../model/types";

const optNum = (d: Dict, ...keys: string[]): number | undefined => {
  for (const k of keys) if (d[k] != null && d[k] !== "" && Number.isFinite(Number(d[k]))) return Number(d[k]);
  return undefined;
};

export function normService(v: unknown, locale = "uz"): AdminService {
  const d = asDict(v);
  const latn = asStr(d.title_uz_latn);
  const cyrl = asStr(d.title_uz_cyrl);
  const ru = asStr(d.title_ru);
  const code = asStr(d.catalog_code);
  const hasMetadata = (d.standard_price != null && d.standard_price !== "") || !!(code || cyrl || latn || ru || asStr(d.executor_type));
  const raw = asStr(d.title);
  const shown = asStr((locale === "ru" ? d.title_ru : d.title_uz_latn) ?? d.title ?? d.name);
  return {
    id: asStr(d.id),
    name: cleanTitle(shown) || shown,
    title: cleanTitle(raw) || raw,
    slug: asStr(d.slug),
    categoryId: asStr(d.category_id),
    categoryTitle: asStr(d.category_title),
    description: asStr(d.description),
    price: optNum(d, "standard_price", "base_price"),
    basePrice: optNum(d, "base_price"),
    standardPrice: hasMetadata ? optNum(d, "standard_price") : undefined,
    currency: asStr(d.currency) || "UZS",
    deliveryMinutes: d.delivery_minutes == null ? undefined : asNum(d.delivery_minutes),
    isActive: d.is_active !== false && d.is_active !== 0,
    catalogCode: code,
    titleUzLatn: latn,
    titleUzCyrl: cyrl,
    titleRu: ru,
    executorType: asStr(d.executor_type),
    advokatRequired: !!d.advokat_required,
    pricingTier: asStr(d.pricing_tier),
    slaCode: asStr(d.sla_code),
    refundCode: asStr(d.refund_code),
    aiCategory: asStr(d.ai_category),
    hasMetadata,
    documentTemplateId: asStr(d.document_template_id),
  };
}

// GET /admin/services — the whole catalogue incl. inactive rows (the endpoint has no paging); category_id / is_active filter on the server.
export async function listServices(f: { categoryId: string; isActive?: boolean }, locale: string): Promise<AdminService[]> {
  const qs = new URLSearchParams();
  if (f.categoryId) qs.set("category_id", f.categoryId);
  if (f.isActive != null) qs.set("is_active", String(f.isActive));
  const data = await http(`/admin/services${qs.size ? `?${qs}` : ""}`);
  return listFrom(data, "services", "items", "data").map((x) => normService(x, locale));
}

export async function createService(b: ServiceCreate): Promise<void> {
  await http("/admin/services", { method: "POST", body: b });
}

// PATCH /admin/services/{id} — only changed keys; `metadata` applies only to catalogue services.
export async function updateService(id: string, b: ServiceUpdate, locale: string): Promise<AdminService> {
  return normService(await http(`/admin/services/${encodeURIComponent(id)}`, { method: "PATCH", body: b }), locale);
}

// DELETE /admin/services/{id} — soft delete (is_active = false).
export async function deleteService(id: string): Promise<void> {
  await http(`/admin/services/${encodeURIComponent(id)}`, { method: "DELETE" });
}
