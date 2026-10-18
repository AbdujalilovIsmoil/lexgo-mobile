import { asDict, asStr, uzs, type Dict } from "@/shared/lib/json";
import type { DocRow } from "../model/types";
import { PAY_WAIT, READY } from "../lib/status";
import { cleanTitle } from "../lib/title";
import { modeOf, normCtor, normGate, normRating } from "./normBits";

// Rows from the light list and from the detail share their flat keys.
export function baseRow(d: Dict): DocRow {
  const status = asStr(d.status);
  const cf = asDict(d.contract_file);
  return {
    id: asStr(d.id),
    workId: asStr(d.work_id),
    title: cleanTitle(asStr(d.title)),
    status,
    statusLabel: asStr(d.status_label),
    mode: modeOf(d.mode),
    price: uzs(d, "price"),
    currency: asStr(d.currency, "UZS"),
    requestedType: asStr(d.requested_document_type),
    createdAt: asStr(d.created_at),
    templateId: asStr(d.template_id),
    fileReady: READY.has(status) || cf.status === "ready",
    format: asStr(cf.file_name).split(".").pop() ?? "",
    lawyer: asStr(asDict(d.assigned_lawyer).name),
    nextAction: "",
    meeting: "",
    rating: normRating(d.rating, d),
    lawyerActive: d.lawyer_request_active === true,
    canSend: d.can_send_lawyer_request !== false,
    blockReason: asStr(d.lawyer_request_block_reason),
    ctor: normCtor(d.constructor_action),
    paymentRequired: d.payment_required === true || normGate(d.payment_gate)?.status === "pending" || PAY_WAIT.has(status),
  };
}

const meetingOf = (d: Dict): string => {
  const raw = d.meeting ?? d.active_meeting ?? d.meeting_status;
  const m = asDict(raw);
  const s = typeof raw === "string" ? raw : asStr(m.status);
  return m.active === true || m.is_active === true || /active|live|ongoing/i.test(s) ? "active" : s;
};

// GET /document-requests/service-flow item: a summary with the request nested in `document_request`.
export function normFlow(v: unknown): DocRow {
  const d = asDict(v);
  const file = asDict(d.file);
  const row = baseRow({ ...asDict(d.document_request), ...d });
  return { ...row, fileReady: file.ready === true, format: asStr(file.format), nextAction: asStr(d.next_action), meeting: meetingOf(d) };
}

// GET /document-requests (light list): enough for search, counts and work ids.
export const normLite = (v: unknown): DocRow => baseRow(asDict(v));
