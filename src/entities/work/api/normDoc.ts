import { asArr, asDict, asStr, uzs } from "@/shared/lib/json";
import type { Work } from "../model/types";
import type { WorkDetail } from "../model/detailTypes";
import { baseEvents } from "./normEvents";
import { normAttachments, normResultFile } from "./normFiles";
import { normRating } from "./normRating";
import { normComplaint } from "./normComplaint";

export type Part = Omit<WorkDetail, "work">;

// document_lawyer_work: summary, lawyer_request, document, chat, meeting, rating, complaints.
// Lawyer-side fields of lawyer_request (claim/editor urls, can_claim …) are never read.
export function normDoc(w: Work, d: Record<string, unknown>): Part {
  const doc = asDict(d.document);
  const lr = asDict(d.lawyer_request);
  const chat = asDict(d.chat);
  const meeting = asDict(d.meeting);
  const amount = uzs(doc, "price");
  const required = Boolean(doc.requires_payment || doc.payment_required);
  const need = asStr(lr.need) || asStr(asDict(doc.answers).need);
  return {
    roomId: chat.available === false ? "" : asStr(chat.room_id),
    callId: asStr(meeting.call_id),
    payment: amount > 0 || required ? { amount, currency: asStr(doc.currency) || "UZS", status: asStr(doc.payment_status), paid: Boolean(doc.paid), required } : null,
    timeline: baseEvents(w),
    files: [...normResultFile(doc.contract_file), ...normAttachments(lr.attachments)],
    rating: normRating(d.rating, doc),
    complaints: asArr(d.complaints).map(normComplaint),
    related: { kind: "document", id: asStr(doc.id) || w.documentRequestId },
    info: { need, docType: asStr(lr.requested_document_type) || asStr(doc.requested_document_type), fileName: asStr(lr.main_file_name) },
  };
}
