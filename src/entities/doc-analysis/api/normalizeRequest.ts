import { asDict, asNum, asStr, uzs } from "@/shared/lib/json";
import type { DocRequestState, HandoffResult, PayGate } from "../model/types";

function normGate(v: unknown): PayGate | null {
  if (!v || typeof v !== "object") return null;
  const d = asDict(v);
  if (!d.id && !d.payment_id && !d.amount) return null;
  return {
    id: asStr(d.id),
    status: asStr(d.status),
    amount: uzs(d, "amount"),
    currency: asStr(d.currency, "UZS"),
    pageCount: asNum(d.page_count),
    includedPages: asNum(d.included_pages),
    extraPages: asNum(d.extra_pages),
    telegramSent: Boolean(d.telegram_sent),
  };
}

// Same reading as the website's normDocLawyerSubmit: the request may sit under
// `request`, `document_request` or be the body itself.
export function normHandoff(v: unknown): HandoffResult {
  const d = asDict(v);
  const r = asDict(d.request ?? d.document_request ?? d);
  return {
    requestId: asStr(r.id),
    workId: asStr(r.work_id),
    status: asStr(r.status),
    paymentRequired: Boolean(d.payment_required ?? r.payment_required),
    alreadyExists: Boolean(d.already_exists),
    gate: normGate(d.payment_gate ?? r.payment_gate),
    message: asStr(d.message) || asStr(d.detail),
  };
}

export function normRequestState(v: unknown): DocRequestState {
  const d = asDict(v);
  return { id: asStr(d.id), workId: asStr(d.work_id), status: asStr(d.status), paymentRequired: Boolean(d.payment_required), gate: normGate(d.payment_gate) };
}
