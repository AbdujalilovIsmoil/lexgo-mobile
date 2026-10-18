import type { LinkInput } from "../types";

export type Expect = { kind?: "target" | "blocked" | "none"; href?: string; fallback?: string; probe?: string; label?: string };
export type Case = [name: string, viewer: string, input: LinkInput, expect: Expect];

const R = "room-1";
const ev = (event: string, data: Record<string, string> = {}): LinkInput => ({ event, data });

// Events seen on staging (see tz-status/INFRA.md) → the screen each role gets.
export const EVENT_CASES: Case[] = [
  ["chat message, client", "client", ev("secure_chat_message", { room_id: R }), { href: `/chat/${R}`, fallback: "/(tabs)/messages", probe: `/secure-chats/${R}` }],
  ["chat message, seller", "seller", ev("secure_chat_message", { room_id: R }), { href: `/chat/${R}` }],
  ["chat message without a room", "client", ev("secure_chat_message"), { href: "/(tabs)/messages" }],
  ["meeting invite", "client", ev("meeting_invite", { room_id: R, call_id: "c1" }), { href: `/call/${R}?callId=c1`, fallback: `/chat/${R}`, probe: `/secure-chats/${R}/calls/c1`, label: "call" }],
  ["express call", "client", ev("urgent_advokat.express_call_started", { room_id: R, call_id: "c1", record_id: "u1" }), { href: `/call/${R}?callId=c1` }],
  ["doc ready, client", "client", ev("document_request_file_ready", { document_request_id: "d1" }), { href: "/documents/d1", fallback: "/documents", probe: "/document-requests/d1" }],
  ["doc claimed, seller", "seller", ev("document_lawyer_request_claimed", { document_request_id: "d1", record_id: "r1" }), { href: "/pro/docs/r1", fallback: "/pro/docs" }],
  ["doc pool, seller", "seller", ev("document_request.pool_created", { document_request_id: "d1" }), { href: "/pro/docs/pool" }],
  ["doc, staff", "staff", ev("document_request_created", { document_request_id: "d1" }), { kind: "none" }],
  ["doc payment required", "client", ev("document_review_payment_required", { document_request_id: "d1", payment_id: "p1" }), { href: "/documents/d1" }],
  ["urgent, client", "client", ev("urgent_advokat.request_claimed", { record_id: "u1" }), { href: "/urgent/u1", fallback: "/urgent", probe: "/urgent-advokat/requests/u1" }],
  ["urgent, seller", "seller", ev("urgent_advokat.transferred", { record_id: "u1" }), { href: "/pro/urgent/u1", fallback: "/pro/urgent" }],
  ["urgent, call center", "cc", ev("urgent_advokat.cancelled", { record_id: "u1" }), { href: "/cc/urgent/u1" }],
  ["urgent, staff", "staff", ev("urgent_advokat.cancelled", { record_id: "u1" }), { href: "/cc/urgent/u1" }],
  ["support message, client", "client", ev("support.ticket_message", { ticket_id: "t1" }), { href: "/support/t1", probe: "/support/tickets/t1" }],
  ["support created, call center", "cc", ev("support.ticket_created", { ticket_id: "t1" }), { href: "/(tabs)/csupport" }],
  ["support assist, call center", "cc", ev("support.assist_requested", { ticket_id: "t1" }), { href: "/cc/assist/t1" }],
  ["support created, staff", "staff", ev("support.ticket_created", { ticket_id: "t1" }), { href: "/manage/support/ticket?id=t1" }],
  ["payment paid", "client", ev("payment_paid", { payment_id: "p1" }), { href: "/payments/p1", fallback: "/payments" }],
  ["order, client", "client", ev("order_created", { order_id: "o1" }), { href: "/orders/o1", fallback: "/orders", probe: "/orders/o1/status-history" }],
  ["order, seller", "seller", ev("order_accepted", { order_id: "o1" }), { href: "/pro/orders/o1", fallback: "/pro/orders" }],
  ["marketplace order has no probe", "client", ev("marketplace_purchase_approved", { order_id: "o1" }), { href: "/orders/o1" }],
  ["order payment updated", "client", ev("order_payment_updated", { order_id: "o1", payment_id: "p1" }), { href: "/orders/o1" }],
];
