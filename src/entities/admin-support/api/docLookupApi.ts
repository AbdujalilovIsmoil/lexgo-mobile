import { http } from "@/shared/api";
import { asArr, asDict, asStr, uzs } from "@/shared/lib/json";
import type { DocService, DocTypes } from "../model/lookupTypes";
import { cleanTitle } from "./dict";

export async function getDocTypes(): Promise<DocTypes> {
  const d = asDict(await http("/document-services/request-document-types"));
  const names = (v: unknown) => asArr(v).map((x) => asStr(x)).filter(Boolean);
  return { items: names(d.items), custom: d.custom_allowed !== false, appliesTo: names(d.applies_to), notAppliesTo: names(d.not_applies_to) };
}

// GET /services/search — services a document can be based on.
export async function searchDocServices(q: string): Promise<DocService[]> {
  const qs = new URLSearchParams({ q: q.trim().slice(0, 120), limit: "20" });
  return asArr(await http(`/services/search?${qs}`))
    .map((v) => asDict(asDict(v).service))
    .filter((s) => s.is_active !== false && asStr(s.id))
    .map((s) => ({ id: asStr(s.id), name: cleanTitle(s.title ?? s.name), categoryTitle: asStr(s.category_title), price: uzs(s, "standard_price", "base_price", "price"), templateId: asStr(s.document_template_id) }))
    .sort((a, b) => Number(Boolean(b.templateId)) - Number(Boolean(a.templateId)));
}
