import { asArr, asDict, asNum, asStr } from "@/shared/lib/json";
import { cleanDocTitle } from "@/shared/lib/doc/cleanTitle";
import type { DocPreview, GeneratedDoc, MissingField } from "../model/types";

export function normMissing(v: unknown): MissingField[] {
  return asArr(v).map((x) => {
    const d = asDict(x);
    const key = asStr(d.key) || asStr(d.name);
    return { key, label: asStr(d.label) || key };
  }).filter((m) => m.key);
}

export function normPreview(v: unknown): DocPreview {
  const d = asDict(v);
  return {
    text: asStr(d.preview_text ?? d.final_text),
    missing: normMissing(d.missing_required_fields),
    canGenerate: Boolean(d.can_generate),
    percent: asNum(d.completion_percent),
  };
}

// { document_request, file } — the finished request and its server-built file.
export function normGenerated(v: unknown): GeneratedDoc {
  const d = asDict(v);
  const r = asDict(d.document_request ?? d.request);
  const f = asDict(d.file ?? r.contract_file);
  const path = asStr(f.download_url) || asStr(f.inline_url);
  return {
    requestId: asStr(r.id),
    workId: asStr(r.work_id),
    title: cleanDocTitle(asStr(r.title)),
    status: asStr(r.status),
    paid: r.paid !== false,
    price: asNum(r.price),
    mode: asStr(r.mode ?? d.mode),
    file: path ? { name: asStr(f.file_name), mime: asStr(f.mime_type), path, format: asStr(f.format) } : null,
  };
}
