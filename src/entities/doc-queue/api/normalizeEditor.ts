import { asDict, asStr, listFrom } from "@/shared/lib/json";
import type { EditorSession, FinalizeResult, SourceOption, Sources } from "../model/editorTypes";

function normOption(v: unknown): SourceOption {
  const d = asDict(v);
  return {
    key: asStr(d.key) || asStr(d.source_type),
    type: asStr(d.source_type) || asStr(d.key),
    title: asStr(d.title),
    note: asStr(d.description) || asStr(d.note) || asStr(d.reason),
    available: d.available !== false && d.editable !== false,
    attachmentId: asStr(d.attachment_id),
    kind: asStr(d.source_kind),
  };
}

// `current_source` is {source, label, attachment_id} (older builds sent a plain string).
export function normSources(v: unknown): Sources {
  const d = asDict(v);
  const cur = asDict(d.current_source);
  return {
    current: typeof d.current_source === "string" ? d.current_source : asStr(cur.source),
    currentAttachment: asStr(cur.attachment_id),
    label: asStr(cur.label),
    options: listFrom(d, "sources", "options", "items").map(normOption),
  };
}

const PLAIN = ["blank", "ai_draft", "template", "clean_template"];
export function isCurrentSource(o: SourceOption, s: Sources): boolean {
  if (o.type === "attachment") return !!o.attachmentId && o.attachmentId === s.currentAttachment && !PLAIN.includes(s.current);
  return o.type === (s.current === "clean_template" ? "template" : s.current);
}

// The OnlyOffice block is kept exactly as the server sent it (it is signed).
export function normEditor(v: unknown, fallbackId: string): EditorSession {
  const d = asDict(v);
  const oo = asDict(d.onlyoffice);
  const serverUrl = asStr(oo.document_server_url).replace(/\/+$/, "");
  return {
    recordId: asStr(d.record_id) || fallbackId,
    sessionId: asStr(d.session_id),
    provider: asStr(d.provider),
    configured: (typeof oo.configured === "boolean" ? oo.configured : true) && !!serverUrl && !!asDict(oo.document).url,
    serverUrl,
    origin: /^https?:\/\/[^/]+/i.exec(serverUrl)?.[0] ?? "",
    config: oo,
    fileUrl: asStr(asDict(d.file).download_url),
  };
}

export function normFinalize(v: unknown): FinalizeResult {
  const d = asDict(v);
  const file = asDict(d.file ?? asDict(d.lawyer_request).contract_file);
  return {
    status: asStr(asDict(d.lawyer_request).status) || asStr(asDict(d.request).status),
    fileName: asStr(file.file_name),
    filePath: asStr(file.inline_url) || asStr(file.download_url),
    ratingDeadline: asStr(asDict(d.request).rating_deadline_at),
  };
}
