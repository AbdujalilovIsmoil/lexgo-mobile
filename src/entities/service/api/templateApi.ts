import { http } from "@/shared/api";
import { asDict, asStr } from "@/shared/lib/json";
import { cleanDocTitle } from "@/shared/lib/doc/cleanTitle";

export type TemplateSource = { templateId: string; title: string; hasFile: boolean; path: string; name: string; mime: string };

// GET /services/{id}/document-fields — only the blank template's file facts. The clean copy
// ({{field}} markers replaced by blanks) wins; the marked-up one is the fallback for old services.
export async function getTemplateSource(serviceId: string): Promise<TemplateSource> {
  const d = asDict(await http(`/services/${encodeURIComponent(serviceId)}/document-fields`));
  const path = asStr(d.clean_source_file_url) || asStr(d.clean_source_file_inline_url) || asStr(d.source_file_url) || asStr(d.source_file_inline_url);
  return {
    templateId: asStr(d.template_id),
    title: cleanDocTitle(asStr(d.title)),
    hasFile: Boolean(d.has_source_file) && !!path,
    path,
    name: asStr(d.source_file_name),
    mime: asStr(d.source_mime_type),
  };
}
