import type { ResultFile } from "../model/extraTypes";

export type CompletionBody = { result_text?: string; result_files?: { file_id: string; file_name: string; download_url: string }[] };

// TZ 13: a completion needs non-empty text and/or at least one file; null = block the submit (the server would answer marketplace_result_required).
export function completionBody(text: string, files: ResultFile[]): CompletionBody | null {
  const t = text.trim();
  if (!t && !files.length) return null;
  return { ...(t ? { result_text: t } : {}), ...(files.length ? { result_files: files.map((f) => ({ file_id: f.fileId, file_name: f.fileName, download_url: f.downloadUrl })) } : {}) };
}

// `/secure-files/<uuid>` (or any path holding a uuid) -> the last uuid in it; "" when there is none.
export const fileIdFromPath = (path: string): string => path.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi)?.pop() ?? "";
