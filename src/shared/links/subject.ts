import { dict, str, type Dict, type LinkInput, type Subject, type SubjectKind } from "./types";

// Exact event names first (they beat the prefix rules), then prefixes, then the TZ entity_type.
const EXACT: Record<string, SubjectKind> = {
  meeting_invite: "call", call_extension_approved: "call", document_request_meeting_created: "call",
  "urgent_advokat.meeting_created": "call", "urgent_advokat.express_call_started": "call",
  document_review_payment_required: "doc", contract_signature_otp: "doc", order_payment_updated: "order",
  call_extension_payment_requested: "payment", document_payment_auto_confirmed: "payment",
  // TZ.md §14: the plan's renewal needs the client's consent — the subscription page asks for it.
  "subscription.renewal_consent_required": "subscription", subscription_renewal_consent_required: "subscription",
  // The call center's decision on the seller's experience (Gaps Closed §3.13) is not about an order: it opens the experience page.
  "marketplace.experience_reviewed": "experience", marketplace_experience_reviewed: "experience",
  // TZ.md §10: a seller accepted a service rule — it is about their services, not an order (it carries no order id).
  "marketplace.rule_accepted": "service", marketplace_rule_accepted: "service",
};
const PREFIX: [RegExp, SubjectKind][] = [
  [/^(secure_chat|chat\.|message)/, "chat"], [/^call\./, "call"], [/^urgent_advokat\./, "urgent"], [/^support\./, "ticket"],
  // Every marketplace event (marketplace.assignment_received / _expired, marketplace.advance_paid, marketplace.final_paid, the complaint and
  // warranty of an order …) and order_* opens that order (TZ.md §14) — before the generic complaint / payment rules below.
  [/^(marketplace[._]|order|warranty)/, "order"],
  [/^(quality_complaint|complaint)/, "complaint"], [/^(sos|milestone)/, "order"],
  [/^(payment|payout|invoice|refund|document_payment)/, "payment"], [/^(subscription|plan_)/, "subscription"],
  [/^(document|ai_document|existing_document|custom_document|contract|workspace_file|file_)/, "doc"],
  [/^calendar_event/, "calendar"], [/^promotion\./, "promotion"], [/^(seller_register|register_request)/, "registration"],
  [/^(identity|security|account|password|2fa|login|session)/, "security"], [/^(upsell|gift)/, "gift"], [/^referral/, "referral"],
];
const ENTITY: Record<string, SubjectKind> = {
  document_request: "doc", document: "doc", order: "order", service_order: "order", marketplace_order: "order", payment: "payment",
  support_ticket: "ticket", ticket: "ticket", secure_chat: "chat", chat: "chat", chat_room: "chat", room: "chat", call: "call",
  call_session: "call", meeting: "call", urgent_request: "urgent", urgent_advokat: "urgent", complaint: "complaint", subscription: "subscription", case: "case",
};
const ID_KEYS: Partial<Record<SubjectKind, string[]>> = {
  chat: ["room_id", "secure_chat_room_id"], call: ["room_id"], urgent: ["record_id"], ticket: ["ticket_id"], complaint: ["work_id"],
  order: ["order_id", "marketplace_order_id", "target_id"], payment: ["payment_id"], doc: ["document_request_id"], case: ["case_id"],
};

// TZ.md §13–14: the call center's separate cancellation discussion opens its own room (read-only once closed) — the order only when the
// event names no room.
const ROOM_FIRST = /^marketplace[._]cancellation_chat_(created|closed)$/;

function idFor(kind: SubjectKind, data: Dict): string {
  for (const k of ID_KEYS[kind] ?? []) if (str(data[k])) return str(data[k]);
  return "";
}

export function subjectOf(input: LinkInput): Subject | null {
  const data = dict(input.data);
  const event = (input.event || str(data.event)).toLowerCase();
  const entity = ENTITY[(input.entityType ?? "").toLowerCase()];
  const kind: SubjectKind | undefined = ROOM_FIRST.test(event) && str(data.room_id) ? "chat" : EXACT[event] ?? PREFIX.find(([re]) => event && re.test(event))?.[1] ?? entity;
  if (!kind) return null;
  const merged = { ...data };
  if (entity === kind && input.entityId) {
    if (kind === "call") merged.call_id = str(merged.call_id) || input.entityId;
    else merged[(ID_KEYS[kind] ?? ["id"])[0]] = input.entityId;
  }
  return { kind, id: idFor(kind, merged), event, data: merged };
}
