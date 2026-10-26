export type ResultRef = { id: string; name: string; url: string };
export type CompletionBody = { result_text?: string; result_files?: { file_id: string; file_name: string; download_url: string }[] };

// TZ §9: a completion needs non-empty text and/or at least one file; null = block the submit (the server would answer
// marketplace_result_required).
export function completionBody(text: string, files: ResultRef[]): CompletionBody | null {
  const t = text.trim();
  if (!t && !files.length) return null;
  return { ...(t ? { result_text: t } : {}), ...(files.length ? { result_files: files.map((f) => ({ file_id: f.id, file_name: f.name, download_url: f.url })) } : {}) };
}
