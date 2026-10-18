import { asArr, asDict, asNum, asStr } from "@/shared/lib/json";
import type { WorkFile } from "../model/detailTypes";

// The finished file of a document work (contract_file) — its base64 copy is ignored.
export function normResultFile(v: unknown): WorkFile[] {
  const d = asDict(v);
  const path = asStr(d.download_url);
  if (!path) return [];
  return [{ id: asStr(d.id) || path, name: asStr(d.file_name) || asStr(d.contract_type), mime: asStr(d.mime_type), size: 0, path, role: "result" }];
}

// Files attached to the lawyer request: the client's uploads and whatever the lawyer added.
export function normAttachments(v: unknown): WorkFile[] {
  return asArr(v).flatMap((x) => {
    const a = asDict(x);
    const p = asDict(a.payload);
    const path = asStr(a.download_url);
    if (!path) return [];
    const type = asStr(a.record_type);
    return [{ id: asStr(a.id) || path, name: asStr(p.file_name) || asStr(a.title), mime: asStr(p.mime_type), size: asNum(p.size), path, role: type === "main_document" || type === "file" ? "upload" : "result" } as WorkFile];
  });
}

// Urgent request: payload.files and payload.voice_messages (objects, or bare urls in old records).
export function normUrgentFiles(v: unknown): WorkFile[] {
  return asArr(v).flatMap((x) => {
    const d = asDict(x);
    const path = typeof x === "string" ? x : asStr(d.url ?? d.file_url ?? d.download_url ?? d.path);
    if (!path) return [];
    const name = asStr(d.name ?? d.file_name ?? d.filename ?? d.title) || path.split("/").pop() || path;
    return [{ id: asStr(d.id) || path, name, mime: asStr(d.content_type ?? d.mime_type), size: asNum(d.size ?? d.file_size), path, role: "upload" as const }];
  });
}
