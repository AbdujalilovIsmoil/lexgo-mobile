import { File } from "expo-file-system";
import { http } from "@/shared/api";
import { asArr, asDict, asNum } from "@/shared/lib/json";
import type { ImportMeta, PickedFile, Template } from "../model/types";
import { normTemplate } from "./norm";

// Expo's fetch only takes string / Blob / File parts: the picked file is opened as an expo-file-system File.
function form(file: PickedFile, fields: Record<string, string>): FormData {
  const f = new FormData();
  Object.entries(fields).forEach(([k, v]) => f.append(k, v));
  f.append("file", new File(file.uri) as unknown as Blob, file.name);
  return f;
}

// POST /admin/document-templates/import-docx — one DOCX → an inactive draft template; the {{field}} markers become fields.
export async function importDocx(file: PickedFile, m: ImportMeta): Promise<Template> {
  const body = form(file, { slug: m.slug ?? "", title: m.title ?? "", category: m.category, language: m.language, visibility: m.visibility, price: String(m.price ?? 0) });
  return normTemplate(await http("/admin/document-templates/import-docx", { method: "POST", body }));
}

// POST /admin/document-templates/import-zip — many DOCX files at once (drafts); answers { created: n, slugs: [] }.
export async function importZip(file: PickedFile, m: ImportMeta): Promise<number> {
  const body = form(file, { category: m.category, language: m.language, visibility: m.visibility });
  const d = asDict(await http("/admin/document-templates/import-zip", { method: "POST", body }));
  const list = asArr(d.created ?? d.items ?? d.templates);
  return asNum(d.count) || (typeof d.created === "number" ? d.created : list.length) || asArr(d.slugs).length;
}
