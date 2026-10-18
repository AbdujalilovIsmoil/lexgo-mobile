import type { Case } from "./cases1";

const ev = (event: string, data: Record<string, string> = {}) => ({ event, data });

export const MORE_CASES: Case[] = [
  ["complaint, client", "client", ev("quality_complaint.created", { work_id: "DOC-1" }), { href: "/rate/DOC-1", fallback: "/(tabs)/works" }],
  ["complaint, call center", "cc", ev("quality_complaint.created", { work_id: "DOC-1" }), { href: "/cc/complaints" }],
  ["complaint, seller", "seller", ev("quality_complaint.created", { work_id: "DOC-1" }), { kind: "none" }],
  ["subscription", "client", ev("subscription_activated"), { href: "/subscription" }],
  ["subscription, staff", "staff", ev("subscription_activated"), { kind: "none" }],
  ["calendar, seller", "seller", ev("calendar_event_created"), { href: "/pro/calendar" }],
  ["calendar, client", "client", ev("calendar_event_created"), { kind: "none" }],
  ["studio, staff", "staff", ev("studio.object_reviewed", { object_id: "x" }), { href: "/manage/studio/objects" }],
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
];
