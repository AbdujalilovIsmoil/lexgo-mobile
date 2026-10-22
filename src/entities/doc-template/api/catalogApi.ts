import { http } from "@/shared/api";
import { asArr, asDict, asNum, asStr, listFrom } from "@/shared/lib/json";
import { cleanDocTitle } from "@/shared/lib/doc/cleanTitle";
import type { DocTemplate } from "../lib/match";
import { normTemplate } from "./templateApi";

// GET /document-template-categories — what the filter lists: key (filters), title (display), how many templates, in which languages.
export type TemplateCategoryInfo = { key: string; title: string; count: number; languages: string[] };

export async function listTemplateCategories(): Promise<TemplateCategoryInfo[]> {
  return listFrom(await http("/document-template-categories"), "categories", "items", "data").map((v) => {
    const d = asDict(v);
    return { key: asStr(d.key), title: asStr(d.title), count: asNum(d.templates_count), languages: asArr(d.languages).map((x) => asStr(x)).filter(Boolean) };
  }).filter((c) => c.key);
}

// GET /document-templates/{id} — the source of truth once a template is open (never the list row alone).
export type TemplateDetail = DocTemplate & { text: string };

export async function getTemplateDetail(id: string): Promise<TemplateDetail> {
  const d = asDict(await http(`/document-templates/${encodeURIComponent(id)}`));
  const row = normTemplate(d);
  return { ...row, name: cleanDocTitle(row.name), text: asStr(d.template_text) };
}

// The clean (marker-free) source: the only copy of the blank a client may open. Needs the bearer token.
export const cleanTemplatePath = (id: string): string => `/document-templates/${encodeURIComponent(id)}/clean-source-file`;

// Services linked to a template: with one, the service's own endpoints and screens apply; without, the generic /document-requests flow.
// Maps template id → service id (a handful of rows: the catalogue holds ≈1000 templates but only a few services).
export async function listLinkedServices(): Promise<Record<string, string>> {
  const rows = listFrom(await http("/services?catalog_only=false&summary=false&limit=500"), "services", "items", "data");
  const map: Record<string, string> = {};
  for (const r of rows) {
    const d = asDict(r);
    const tpl = asStr(d.document_template_id);
    if (tpl && asStr(d.id) && d.is_active !== false) map[tpl] = asStr(d.id);
  }
  return map;
}
