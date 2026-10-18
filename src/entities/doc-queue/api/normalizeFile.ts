import { asDict, asNum, asStr } from "@/shared/lib/json";
import type { DocFile } from "../model/types";

const pathOf = (d: Record<string, unknown>) => asStr(d.download_url) || asStr(d.inline_url);

// A client attachment (`record_type` main_document | file | voice …).
export function normAttachment(v: unknown): DocFile {
  const d = asDict(v);
  const p = asDict(d.payload);
  return {
    id: asStr(d.id),
    name: asStr(p.file_name) || asStr(d.title),
    mime: asStr(p.mime_type),
    size: asNum(p.size),
    path: pathOf(d),
    note: asStr(p.note),
    kind: asStr(d.record_type),
  };
}

// The service template (clean source file, no {{field}} markers). Null without a file.
export function normTemplateFile(v: unknown): DocFile | null {
  const d = asDict(v);
  if (!d.has_file || !pathOf(d)) return null;
  return { id: asStr(d.template_id), name: asStr(d.file_name), mime: asStr(d.mime_type), size: 0, path: pathOf(d), note: "", kind: "template" };
}

// The delivered contract. `file_base64` (the whole file inline) is deliberately ignored.
export function normContract(v: unknown): DocFile | null {
  const d = asDict(v);
  if (!pathOf(d)) return null;
  return { id: asStr(d.id), name: asStr(d.file_name), mime: asStr(d.mime_type), size: 0, path: pathOf(d), note: "", kind: "contract" };
}
