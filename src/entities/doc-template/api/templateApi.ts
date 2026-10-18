import { http } from "@/shared/api";
import { asDict, asStr, listFrom } from "@/shared/lib/json";
import { downloadAndShare } from "@/shared/lib/files";
import { safeUploadName } from "@/shared/lib/safeName";

import type { DocTemplate } from "../lib/match";

// GET /document-templates — the public template catalogue (what the web lawyer portal's "Hujjatlar" lists).
export async function listTemplates(): Promise<DocTemplate[]> {
  return listFrom(await http("/document-templates"), "templates", "items", "data").map((v) => {
    const d = asDict(v);
    return { id: asStr(d.id), name: asStr(d.title ?? d.name), category: asStr(d.category), language: asStr(d.language) };
  }).filter((x) => x.id && x.name);
}

// GET /document-templates/{id}/file — the template as a PDF, handed to the share sheet (save to Files, send, print).
export const shareTemplate = (t: DocTemplate): Promise<void> => downloadAndShare(`/document-templates/${encodeURIComponent(t.id)}/file`, safeUploadName(`${t.name}.pdf`), "application/pdf");
