import type { Case } from "./cases1";

const ev = (event: string, data: Record<string, string> = {}) => ({ event, data });

export const MORE_CASES: Case[] = [
  ["complaint, client", "client", ev("quality_complaint.created", { work_id: "DOC-1" }), { href: "/rate/DOC-1", fallback: "/(tabs)/works" }],
  ["complaint, seller", "seller", ev("quality_complaint.created", { work_id: "DOC-1" }), { kind: "none" }],
  ["subscription", "client", ev("subscription_activated"), { href: "/subscription" }],
  ["subscription, seller", "seller", ev("subscription_activated"), { href: "/subscription" }],
  ["calendar, seller", "seller", ev("calendar_event_created"), { href: "/pro/calendar" }],
  ["calendar, client", "client", ev("calendar_event_created"), { kind: "none" }],
  ["staff-only event opens nothing", "client", ev("studio.object_reviewed", { object_id: "x" }), { kind: "none" }],
  ["lead event opens nothing", "seller", ev("lead.assigned", { lead_id: "l1" }), { kind: "none" }],
  ["registration approved, seller", "seller", ev("seller_register_approved"), { href: "/pro/onboarding" }],
  ["category fallback: orders", "client", { event: "something_new", category: "orders" }, { href: "/orders" }],
  ["category fallback: chat", "seller", { category: "chat" }, { href: "/(tabs)/messages" }],
  ["unknown, no category", "client", ev("something_new"), { kind: "none" }],
  ["entity: support_ticket", "client", { entityType: "support_ticket", entityId: "T9" }, { href: "/support/T9" }],
  ["entity: document_request", "client", { entityType: "document_request", entityId: "D9" }, { href: "/documents/D9" }],
  ["entity: call keeps the room", "client", { entityType: "call", entityId: "c9", data: { room_id: "r9" } }, { href: "/call/r9?callId=c9" }],
  ["deep_link: website documents", "client", { deepLink: "https://lexgo.uz/uz/portal/client/documents?doc=D1" }, { href: "/documents/D1" }],
  ["deep_link: wins over the event", "client", { deepLink: "lexgo://payments/P2", event: "order_created", data: { order_id: "o1" } }, { href: "/payments/P2" }],
  ["deep_link: hostile host ignored", "client", { deepLink: "https://evil.example/portal/client/documents", event: "payment_paid", data: { payment_id: "p1" } }, { href: "/payments/p1" }],
  ["deep_link: seller-only path, client", "client", { deepLink: "lexgo://pro/docs" }, { kind: "none" }],
  ["guard: seller event for a client", "client", ev("document_request.pool_created"), { href: "/documents" }],
  // TZ.md §14: marketplace events open the order by id, for the side that receives them.
  ["assignment received, seller", "seller", ev("marketplace.assignment_received", { order_id: "o1" }), { href: "/pro/orders/o1", fallback: "/pro/orders" }],
  ["assignment expired, seller", "seller", ev("marketplace.assignment_expired", { order_id: "o1" }), { href: "/pro/orders/o1" }],
  ["seller accepted, client", "client", ev("order_accepted", { order_id: "o1" }), { href: "/orders/o1" }],
  ["advance paid, seller", "seller", ev("marketplace.advance_paid", { order_id: "o1" }), { href: "/pro/orders/o1" }],
  ["final paid, client", "client", ev("marketplace.final_paid", { order_id: "o1" }), { href: "/orders/o1" }],
  ["additional payment approved (dot event)", "seller", ev("marketplace.additional_payment_approved", { order_id: "o2" }), { href: "/pro/orders/o2" }],
  ["order completed, client", "client", ev("marketplace.order_completed", { marketplace_order_id: "o3" }), { href: "/orders/o3" }],
  ["order complaint update, client", "client", ev("marketplace.complaint_resolved", { order_id: "o4" }), { href: "/orders/o4" }],
  ["warranty update, client", "client", ev("marketplace.warranty_resolved", { order_id: "o5" }), { href: "/orders/o5" }],
  ["renewal consent, client", "client", ev("subscription.renewal_consent_required"), { href: "/subscription" }],
  ["renewal consent, seller", "seller", ev("subscription_renewal_consent_required"), { href: "/subscription" }],
  // Gaps Closed §3.13: the experience decision opens the experience page, never Orders (it has no order_id).
  ["experience reviewed, seller", "seller", ev("marketplace.experience_reviewed", { experience_id: "e1", decision: "rejected" }), { href: "/pro/experience", fallback: "/pro/experience", label: "experience" }],
  ["experience reviewed (notification name), seller", "seller", ev("marketplace_experience_reviewed", { experience_id: "e1" }), { href: "/pro/experience" }],
  ["experience reviewed, client", "client", ev("marketplace.experience_reviewed", { experience_id: "e1" }), { kind: "none" }],
  ["experience reviewed in a notification's data", "seller", { data: { event: "marketplace.experience_reviewed", experience_id: "e1" } }, { href: "/pro/experience" }],
];
