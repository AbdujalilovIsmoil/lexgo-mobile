import { File } from "expo-file-system";
import { http } from "@/shared/api";
import { asArr, asDict, asNum, asStr } from "@/shared/lib/json";
import type { Passport } from "../model/types";

const serviceIdsFrom = (data: unknown): string[] => asArr(data).map((x) => asStr(asDict(asDict(x).service).id)).filter(Boolean);

// GET /services/search — ids of the server-side hits (Latin / Cyrillic / Russian spellings).
export async function searchServiceIds(q: string): Promise<string[]> {
  return serviceIdsFrom(await http(`/services/search?${new URLSearchParams({ q: q.slice(0, 200), limit: "50" })}`));
}

// GET /services/{id}/passport — catalogue metadata; inactive rows answer 404.
export async function getPassport(id: string): Promise<Passport> {
  const p = asDict(asDict(await http(`/services/${encodeURIComponent(id)}/passport`)).passport);
  const std = p.standard_price != null && Number.isFinite(Number(p.standard_price)) ? Number(p.standard_price) : undefined;
  return {
    catalogCode: asStr(p.catalog_code), family: asStr(p.family), group: asStr(p.group), subcategory: asStr(p.subcategory),
    standardDuration: asStr(p.standard_duration).trim(), urgentDuration: asStr(p.urgent_duration).trim(), version: asStr(p.version),
    executorType: asStr(p.executor_type), advokatRequired: !!p.advokat_required, pricingTier: asStr(p.pricing_tier), standardPrice: std,
    slaCode: asStr(p.sla_code), refundCode: asStr(p.refund_code), aiCategory: asStr(p.ai_category),
  };
}

export type DocxFile = { uri: string; name: string };

// POST /admin/services/{id}/document-template (multipart) — attaches a DOCX document builder; returns the placeholder count.
export async function uploadDocTemplate(serviceId: string, file: DocxFile, m: { slug: string; title: string; price: number }): Promise<number> {
  const form = new FormData();
  form.append("slug", m.slug);
  form.append("title", m.title);
  form.append("category", "service_document");
  form.append("language", "uz-latn");
  form.append("visibility", "client");
  form.append("price", String(m.price));
  form.append("is_active", "true");
  form.append("file", new File(file.uri) as unknown as Blob, file.name);
  const d = asDict(await http(`/admin/services/${encodeURIComponent(serviceId)}/document-template`, { method: "POST", body: form }));
  return asNum(d.field_count, Array.isArray(d.fields) ? d.fields.length : 0);
}
