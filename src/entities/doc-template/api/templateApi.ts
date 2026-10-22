import { http } from "@/shared/api";
import { asArr, asDict, asNum, asStr, listFrom } from "@/shared/lib/json";
import { downloadAndShare } from "@/shared/lib/files";
import { safeUploadName } from "@/shared/lib/safeName";

import type { DocTemplate } from "../lib/match";

const noExt = (s: string) => s.replace(/\.[A-Za-z0-9]{1,8}$/, "").trim();

// The document's name is its `title`; an empty one falls back to the source file's name without the extension — never the UUID.
export function normTemplate(v: unknown): DocTemplate {
  const d = asDict(v);
  return {
    id: asStr(d.id),
    name: asStr(d.title ?? d.name).trim() || noExt(asStr(d.source_file_name)),
    category: asStr(d.category),
    language: asStr(d.language),
    description: asStr(d.description).trim(),
    fields: asArr(d.fields).length,
    sections: asArr(d.sections).length,
    price: asNum(d.price),
    updatedAt: asStr(d.updated_at ?? d.published_at),
    sourceFile: asStr(d.source_file_name),
    hasSource: d.has_source_file === true || !!asStr(d.source_file_name),
  };
}

// GET /document-templates[?category=…] — the template catalogue (what the web lawyer portal's "Hujjatlar" lists). The server does not page
// or search: the whole answer comes at once (≈14 MB for all 989), so the app asks branch by branch.
export async function listTemplates(category?: string): Promise<DocTemplate[]> {
  const raw = await http(`/document-templates${category ? `?category=${encodeURIComponent(category)}` : ""}`);
  return listFrom(raw, "templates", "items", "data").map(normTemplate).filter((x) => x.id && x.name);
}

// GET /document-templates/{id}/file — the template as a PDF, handed to the share sheet (save to Files, send, print).
export const shareTemplate = (t: DocTemplate): Promise<void> => downloadAndShare(`/document-templates/${encodeURIComponent(t.id)}/file`, safeUploadName(`${t.name}.pdf`), "application/pdf");
