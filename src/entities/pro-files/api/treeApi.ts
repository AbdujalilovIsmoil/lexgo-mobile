import { http } from "@/shared/api";
import { asArr, asDict, asNum, asStr } from "@/shared/lib/json";
import { extOf } from "@/shared/lib/fileKind";
import type { FilePatch, Folder, FolderPatch, Quota, Tree, WFile } from "../model/types";

export function normFolder(v: unknown): Folder {
  const d = asDict(v);
  return {
    id: asStr(d.id), workId: asStr(d.work_id), name: asStr(d.name), parentId: asStr(d.parent_id), caseId: asStr(d.case_id),
    starred: Boolean(d.starred), size: asNum(d.size), fileCount: asNum(d.file_count), folderCount: asNum(d.folder_count),
    status: asStr(d.status, "active"), createdAt: asStr(d.created_at),
  };
}

export function normFile(v: unknown): WFile {
  const d = asDict(v);
  const scan = asDict(d.scan);
  const name = asStr(d.file_name);
  return {
    id: asStr(d.id), workId: asStr(d.work_id), folderId: asStr(d.folder_id), caseId: asStr(d.case_id), name,
    size: asNum(d.size), mime: asStr(d.mime_type), ext: asStr(d.extension).replace(/^\./, "").toLowerCase() || extOf(name),
    starred: Boolean(d.starred), status: asStr(d.status, "active"), scan: asStr(scan.scan_status ?? scan.status).toLowerCase(), createdAt: asStr(d.created_at),
  };
}

const normQuota = (v: unknown): Quota => {
  const d = asDict(v);
  return { quotaBytes: asNum(d.quota_bytes), usedBytes: asNum(d.used_bytes), remainingBytes: asNum(d.remaining_bytes), limitGb: asNum(d.limit_gb) };
};

// GET /workspace/tree — every folder and file (flat, parent_id linked) plus the quota, in one call.
// Approved advokat/yurist/advokat_tashkiloti only: pending sellers and clients get 403.
export async function getTree(caseId?: string): Promise<Tree> {
  const d = asDict(await http(`/workspace/tree${caseId ? `?case_id=${encodeURIComponent(caseId)}` : ""}`));
  return { folders: asArr(d.folders).map(normFolder).filter((f) => f.status !== "deleted"), files: asArr(d.files).map(normFile).filter((f) => f.status !== "deleted"), quota: normQuota(d.quota) };
}

export const createFolder = async (b: { name: string; parent_id?: string; case_id?: string }): Promise<Folder> => normFolder(await http("/workspace/folders", { method: "POST", body: b }));
export const updateFolder = async (id: string, b: FolderPatch): Promise<Folder> => normFolder(await http(`/workspace/folders/${encodeURIComponent(id)}`, { method: "PATCH", body: b }));
export const updateFile = async (id: string, b: FilePatch): Promise<WFile> => normFile(await http(`/workspace/files/${encodeURIComponent(id)}`, { method: "PATCH", body: b }));
export async function deleteFolder(id: string): Promise<void> {
  await http(`/workspace/folders/${encodeURIComponent(id)}`, { method: "DELETE" });
}
export async function deleteFile(id: string): Promise<void> {
  await http(`/workspace/files/${encodeURIComponent(id)}`, { method: "DELETE" });
}
