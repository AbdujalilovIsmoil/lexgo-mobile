import { http } from "@/shared/api";
import { asDict, asStr } from "@/shared/lib/json";
import { normSchema } from "./normSchema";
import { normPreview } from "./normResult";
import type { DocPreview, DocSchema } from "../model/types";

// POST /document-templates/{id}/render — the template filled with `answers` by the server (public). The answer carries the preview text
// (placeholders kept where nothing is filled yet) and the section schema in the template's own order.
export async function renderTemplate(templateId: string, answers: Record<string, string>, extraTitle: string): Promise<{ preview: DocPreview; schema: DocSchema; language: string }> {
  const raw = await http(`/document-templates/${encodeURIComponent(templateId)}/render`, { method: "POST", body: { answers } });
  const d = asDict(raw);
  const schema = normSchema(d, "", extraTitle);
  return { preview: normPreview(d), schema: { ...schema, templateId: asStr(d.template_id, templateId) }, language: asStr(d.language) };
}
