import { httpText } from "@/shared/api";
import { asDict } from "@/shared/lib/json";
import { downloadAndShare } from "@/shared/lib/files";
import { safeUploadName } from "@/shared/lib/safeName";

import type { DocTemplate } from "../lib/match";
import { parseTemplates } from "../lib/offThread";
import { slimTemplate } from "../lib/slim";

// A row of the list in the app's shape (see `slimTemplate`: also the worker-runtime path of the big lists).
export const normTemplate = (v: unknown): DocTemplate => slimTemplate(asDict(v));

// GET /document-templates[?category=…] — the template catalogue (what the web lawyer portal's "Hujjatlar" lists). The server does not page
// or search: the whole answer comes at once (≈14 MB for all 989), so the app asks branch by branch.
export async function listTemplates(category?: string): Promise<DocTemplate[]> {
  return parseTemplates(await httpText(`/document-templates${category ? `?category=${encodeURIComponent(category)}` : ""}`));
}

// GET /document-templates/{id}/file — the template as a PDF, handed to the share sheet (save to Files, send, print).
export const shareTemplate = (t: DocTemplate): Promise<void> => downloadAndShare(`/document-templates/${encodeURIComponent(t.id)}/file`, safeUploadName(`${t.name}.pdf`), "application/pdf");
