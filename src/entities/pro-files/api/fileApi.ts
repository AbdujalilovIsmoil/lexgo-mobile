import { http } from "@/shared/api";
import { appendFile } from "@/shared/lib/upload";
import { asDict, asNum, asStr, listFrom } from "@/shared/lib/json";
import type { DocRequest, FileComment, FileVersion, Limits, WFile } from "../model/types";
import { normFile } from "./treeApi";

// POST /workspace/files/upload — multipart field "file" (+ folder_id / case_id).
export async function uploadFile(file: { uri: string; name: string }, where: { folderId?: string; caseId?: string }): Promise<WFile> {
  const form = new FormData();
  appendFile(form, "file", file);
  if (where.folderId) form.append("folder_id", where.folderId);
  if (where.caseId) form.append("case_id", where.caseId);
  return normFile(await http("/workspace/files/upload", { method: "POST", body: form }));
}

// POST /workspace/files/{id}/signed-url — a short-lived link (path) that downloads the bytes.
export async function signedPath(id: string): Promise<string> {
  const d = asDict(await http(`/workspace/files/${encodeURIComponent(id)}/signed-url`, { method: "POST" }));
  return asStr(d.relative_url) || asStr(d.url ?? d.download_url);
}

export async function listVersions(id: string): Promise<FileVersion[]> {
  return listFrom(await http(`/workspace/files/${encodeURIComponent(id)}/versions`), "items", "data", "versions").map((v) => {
    const d = asDict(v);
    return { id: asStr(d.id), version: asNum(d.version), name: asStr(d.file_name), note: asStr(d.note), size: asNum(d.size), createdAt: asStr(d.created_at) };
  });
}

export async function listComments(id: string): Promise<FileComment[]> {
  return listFrom(await http(`/workspace/files/${encodeURIComponent(id)}/comments`), "items", "data", "comments").map((v) => {
    const d = asDict(v);
    return { id: asStr(d.id), text: asStr(d.text), author: asStr(d.author_name), createdAt: asStr(d.created_at) };
  });
}
export const addComment = (id: string, text: string) => http(`/workspace/files/${encodeURIComponent(id)}/comments`, { method: "POST", body: { text } });

// GET /platform/policies (public) → upload limits come from the server, never hard-coded.
export async function getLimits(): Promise<Limits> {
  const ws = asDict(asDict(asDict(await http("/platform/policies", { auth: false })).items).workspace);
  const ext = (v: unknown) => (Array.isArray(v) ? v.map((x) => asStr(x).toLowerCase()) : []);
  return { fileMaxMb: asNum(ws.file_max_mb), videoMaxMb: asNum(ws.video_max_mb), allowed: ext(ws.allowed_extensions), blocked: ext(ws.blocked_extensions) };
}

// Requests this professional sent to clients (GET /workspace/document-requests?role=requester).
export async function listDocRequests(): Promise<DocRequest[]> {
  return listFrom(await http("/workspace/document-requests?role=requester"), "items", "data", "requests").map((v) => {
    const d = asDict(v);
    const f = asDict(d.file);
    return { id: asStr(d.id), title: asStr(d.title), message: asStr(d.message), status: asStr(d.status, "requested"), fileName: asStr(f.file_name), fileUrl: asStr(f.file_url), mime: asStr(f.mime_type), createdAt: asStr(d.created_at) };
  });
}
export const requestClientDocument = (b: { client_user_id: string; title: string; message?: string; case_id?: string }) => http("/workspace/document-requests", { method: "POST", body: b });
