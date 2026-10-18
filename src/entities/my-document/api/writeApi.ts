import { http } from "@/shared/api";
import { asDict, asStr } from "@/shared/lib/json";
import type { DocCall, DocPreview, MyDoc } from "../model/docTypes";
import { normCall, normPreview } from "./normMisc";
import { normDoc } from "./normDoc";

const base = (id: string) => `/document-requests/${encodeURIComponent(id)}`;

export const saveAnswers = async (id: string, answers: Record<string, unknown>): Promise<MyDoc> => normDoc(await http(`${base(id)}/answers`, { method: "PUT", body: { answers } }));
export const previewAnswers = async (id: string, answers: Record<string, unknown>): Promise<DocPreview> => normPreview(await http(`${base(id)}/preview`, { method: "POST", body: { answers } }));
// 402 = not paid, 409 = nothing to build yet, 422 = required fields missing — the caller shows the server text.
export const generateDoc = async (id: string): Promise<MyDoc> => normDoc(await http(`${base(id)}/generate`, { method: "POST" }));

// Snapshot of the current (or the given) answers as a new DOCX version.
export const createVersion = async (id: string, answers?: Record<string, unknown>): Promise<void> => {
  await http(`${base(id)}/versions`, { method: "POST", body: answers ? { answers } : {} });
};

// The client may ring the advocate a limited number of times per document (429 after that).
export const startAudioCall = async (id: string): Promise<DocCall> => normCall(await http(`${base(id)}/calls/audio`, { method: "POST", body: {} }));

export type PayResult = { doc: MyDoc; url: string };
const safeUrl = (u: string) => (/^https:\/\//i.test(u) ? u : "");

// Creates the payment request only. The server — never this client — decides when it is paid.
export async function createPayment(id: string, amount: number): Promise<PayResult> {
  const raw = await http(`${base(id)}/payments`, { method: "POST", body: { provider: "payme", amount: Math.round(amount), currency: "UZS", provider_payload: {} } });
  const d = asDict(raw);
  const pay = d.payment;
  const url = typeof pay === "string" ? pay : asStr(d.payment_url ?? asDict(pay).payment_url ?? asDict(d.invoice).payment_url);
  return { doc: normDoc(raw), url: safeUrl(url) };
}

// 1–2 stars make the backend open a quality complaint; its work id comes back when it did.
export async function rateDoc(id: string, rating: number, comment: string, complaint: string): Promise<string> {
  const body: Record<string, unknown> = { rating, comment };
  if (complaint.trim()) body.complaint = complaint.trim();
  const d = asDict(await http(`${base(id)}/rating`, { method: "POST", body }));
  return asStr(asDict(d.quality_complaint).work_id);
}
