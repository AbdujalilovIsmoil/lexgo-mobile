import { http } from "@/shared/api";
import { appendFile } from "@/shared/lib/upload";
import { normAnalysis, normQuote } from "./normalize";
import { normHandoff, normRequestState } from "./normalizeRequest";
import type { DocAnalysis, DocQuote, DocRequestState, HandoffResult, PickedDoc } from "../model/types";

export type QuoteInput = { pageCount: number; lawyerReview: boolean; urgent: boolean; ocr?: boolean; writtenOpinion?: boolean };

// The page count always comes from the server (the analysis reports it); this
// only prices it. pageCount 1 is used to read the price rules themselves.
export async function quoteAnalysis(i: QuoteInput): Promise<DocQuote> {
  const body = { page_count: Math.max(1, Math.round(i.pageCount)), ocr: Boolean(i.ocr), lawyer_review: i.lawyerReview, urgency: i.urgent ? "urgent" : "normal", written_opinion: Boolean(i.writtenOpinion) };
  return normQuote(await http("/ai/document-analysis/quote", { method: "POST", body }));
}

export async function analyzeText(text: string): Promise<DocAnalysis> {
  return normAnalysis(await http("/ai/document-analysis", { method: "POST", body: { text } }));
}

// PDF, DOC(X) or TXT up to 20 MB (POST /ai/document-analysis/file, multipart).
export async function analyzeFile(file: PickedDoc): Promise<DocAnalysis> {
  const form = new FormData();
  appendFile(form, "file", file);
  // The server echoes its cache name; show the name the user picked.
  return { ...normAnalysis(await http("/ai/document-analysis/file", { method: "POST", body: form })), fileName: file.name };
}

export type HandoffInput = { file: PickedDoc; need: string; pageCount: number; language: string; urgent: boolean };

// "Send this document to an advocate": the analysed file is the advocate's main file.
export async function sendToAdvocate(i: HandoffInput): Promise<HandoffResult> {
  const form = new FormData();
  form.append("need", i.need);
  form.append("language", i.language);
  form.append("urgency", i.urgent ? "urgent" : "normal");
  if (i.pageCount > 0) form.append("page_count", String(i.pageCount));
  appendFile(form, "main_file", i.file);
  return normHandoff(await http("/document-services/review-existing/request", { method: "POST", body: form }));
}

export async function getDocRequestState(id: string): Promise<DocRequestState> {
  return normRequestState(await http(`/document-requests/${encodeURIComponent(id)}`));
}
