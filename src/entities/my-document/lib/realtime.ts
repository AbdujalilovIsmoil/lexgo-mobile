import { asDict, asStr, type Dict } from "@/shared/lib/json";

export type DocEventKind = "required" | "pooled" | "rejected" | "created" | "ready" | "claimed" | "meeting" | "changed" | "prompt";
// `uid` is the event's own identity when the payload has one ("" otherwise): a notification is shown once per identity.
export type DocEvent = { kind: DocEventKind; name: string; ids: string[]; uid: string };

const KIND: Record<string, DocEventKind> = {
  "document_request.payment_required": "required",
  "document_request.pool_created": "pooled",
  "document_request.sent": "pooled",
  "document_request.payment_approved": "pooled",
  "document_request.payment_rejected": "rejected",
  "document_request.payment_cancelled": "rejected",
  "document_request.ready": "ready",
  "document_request.completed": "ready",
  "document_request.claimed": "claimed",
  "document_request.meeting_created": "meeting",
  // transferred / draft_saved / editor_saved fall through to "changed": the list and the open detail are read again.
  document_constructor_continue_prompt: "prompt",
  "support.assist_document_request_created": "created",
  document_review_payment_required: "required",
  document_review_payment_approved: "pooled",
  document_review_payment_rejected: "rejected",
};

const idOf = (v: unknown): string => (typeof v === "string" || typeof v === "number" ? String(v).trim() : "");

// A user-socket event → what it means for the documents list, or null when it is not about documents.
// Events arrive bare or wrapped in `notification.created`; ids sit in several spellings.
export function docEventOf(ev: Dict): DocEvent | null {
  let name = asStr(ev.event);
  let src: Dict = ev;
  if (name === "notification.created") {
    const n = asDict(ev.notification);
    src = asDict(n.data ?? n.meta);
    name = asStr(src.event);
  }
  const kind = KIND[name] ?? (name.startsWith("document_request.") ? "changed" : null);
  if (!kind) return null;
  const action = asDict(src.action ?? asDict(src.message).action);
  const ids = new Set<string>();
  const add = (v: unknown) => {
    const s = idOf(v);
    if (s) ids.add(s);
  };
  // README §14: a record is matched by `document_request_id` or `record_id` (or the older `request_id`).
  for (const x of [src, action, asDict(src.lawyer_request), asDict(action.lawyer_request), asDict(src.payment_gate)]) {
    add(x.document_request_id);
    add(x.record_id);
    add(x.request_id);
  }
  for (const x of [asDict(src.document_request), asDict(action.document_request), asDict(src.request), asDict(action.request)]) add(x.document_request_id ?? x.id);
  // Only an explicit event id counts as the event's identity: a plain `id` may be the record's own, shared by every event about it.
  const uid = idOf(src.event_id ?? ev.event_id ?? asDict(ev.notification).id);
  return { kind, name, ids: [...ids], uid };
}
