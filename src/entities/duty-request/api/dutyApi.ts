import { http } from "@/shared/api";
import { appendFile } from "@/shared/lib/upload";
import type { DutyInput, DutyResult } from "../model/types";
import { normResult } from "./normResult";

const PATH = { custom: "/document-services/custom-draft/request", review: "/document-services/review-existing/request" } as const;

function formOf(i: DutyInput): FormData {
  const f = new FormData();
  f.append("need", i.need);
  if (i.title) f.append("title", i.title);
  f.append("language", i.language);
  if (i.kind === "service") f.append("answers_json", JSON.stringify(i.answers ?? {}));
  if (i.requestedType) f.append("requested_document_type", i.requestedType);
  if (i.pageCount && i.pageCount > 0) f.append("page_count", String(i.pageCount));
  if (i.mainFile) appendFile(f, "main_file", i.mainFile);
  i.files.forEach((x) => appendFile(f, "files", x));
  i.voices.forEach((x) => appendFile(f, "voice_files", x));
  return f;
}

// Plain JSON when nothing is attached, multipart otherwise (voice via expo-audio, files via pickers).
export async function submitDuty(i: DutyInput): Promise<DutyResult> {
  if (i.kind !== "service") return normResult(await http(PATH[i.kind], { method: "POST", body: formOf(i) }));
  const id = encodeURIComponent(i.serviceId ?? "");
  if (i.files.length || i.voices.length) return normResult(await http(`/services/${id}/document-lawyer/request-with-files`, { method: "POST", body: formOf(i) }));
  const body: Record<string, unknown> = { need: i.need, answers: i.answers ?? {}, language: i.language };
  if (i.requestedType) body.requested_document_type = i.requestedType;
  return normResult(await http(`/services/${id}/document-lawyer/request`, { method: "POST", body }));
}

// "Check my finished document" / a template's request with no linked service: a document request already started (POST /document-requests)
// handed to the same duty pool (POST …/lawyer-review, README §11.4). `pageCount` 0 and `urgency` "normal" are what the web sends by default.
export async function requestReview(docId: string, need: string, requestedType?: string, extra?: { pageCount?: number; urgency?: string }): Promise<DutyResult> {
  const body: Record<string, unknown> = { need };
  if (requestedType) body.requested_document_type = requestedType;
  if (extra?.pageCount !== undefined) body.page_count = extra.pageCount;
  if (extra?.urgency) body.urgency = extra.urgency;
  return normResult(await http(`/document-requests/${encodeURIComponent(docId)}/lawyer-review`, { method: "POST", body }));
}
