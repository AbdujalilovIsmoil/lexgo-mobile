import { http } from "@/shared/api";
import { listFrom } from "@/shared/lib/json";
import type { Preview, Template, TemplateInput } from "../model/types";
import { normPreview, normTemplate } from "./norm";

// GET /admin/document-templates — every template incl. inactive ones (no paging on the backend).
export async function listTemplates(): Promise<Template[]> {
  return listFrom(await http("/admin/document-templates"), "templates", "items", "data").map(normTemplate);
}

// GET /document-templates/{id} — the single template incl. its body (template_text).
export async function getTemplate(id: string): Promise<Template> {
  return normTemplate(await http(`/document-templates/${encodeURIComponent(id)}`));
}

export async function createTemplate(b: TemplateInput): Promise<void> {
  await http("/admin/document-templates", { method: "POST", body: { fields: [], ...b } });
}

export async function updateTemplate(id: string, b: Partial<TemplateInput>): Promise<void> {
  await http(`/admin/document-templates/${encodeURIComponent(id)}`, { method: "PATCH", body: b });
}

export async function deleteTemplate(id: string): Promise<void> {
  await http(`/admin/document-templates/${encodeURIComponent(id)}`, { method: "DELETE" });
}

// POST /admin/document-templates/preview — fields and rendered text of a saved template or raw text.
export async function previewTemplate(src: { templateId?: string; templateText?: string }): Promise<Preview> {
  return normPreview(await http("/admin/document-templates/preview", { method: "POST", body: { template_id: src.templateId, template_text: src.templateText } }));
}
