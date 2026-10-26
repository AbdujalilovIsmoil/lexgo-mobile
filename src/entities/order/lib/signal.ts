import { asDict, asStr } from "@/shared/lib/json";

export type MarketTopic = "additional_requested" | "additional_approved" | "additional_rejected" | "additional_escalated" | "refund_approved" | "refund_rejected" | "";
export type MarketSignal = { kind: "paid" | "rejected" | "requested" | "other"; orderId: string; workId: string; roomId: string; topic?: MarketTopic };

// marketplace.additional_payment_* and marketplace.refund_* are not the first payment: they only refresh the order.
export function topicOf(name: string): MarketTopic {
  const m = /^marketplace\.(additional_payment_(requested|approved|rejected|escalated)|refund_(approved|rejected))$/.exec(name);
  if (!m) return "";
  return (m[2] ? `additional_${m[2]}` : `refund_${m[3]}`) as MarketTopic;
}

const ROOM_RE = /\/secure-chats\/([^/?#]+)/;
const room = (id: unknown, url: unknown) => asStr(id) || (ROOM_RE.exec(asStr(url))?.[1] ?? "");

// Reads a user-socket event that concerns a marketplace order (same cases as
// marketSignalOf() on the web); null for everything else.
export function marketSignalOf(ev: { event: string } & Record<string, unknown>): MarketSignal | null {
  const name = ev.event;
  if (name.startsWith("marketplace.")) {
    const topic = topicOf(name);
    const kind = topic ? "other" : /paid|approved/.test(name) ? "paid" : /reject|cancel/.test(name) ? "rejected" : "other";
    return { kind, topic, orderId: asStr(ev.order_id), workId: asStr(ev.work_id) || asStr(asDict(ev.purchase_request).work_id), roomId: room(ev.room_id, ev.chat_url) };
  }
  // TZ §6: order_accepted (the 10 % advance request appears), order_payment_updated … as raw frames: the order is read again.
  if (name.startsWith("order_")) return { kind: "other", orderId: asStr(ev.order_id ?? ev.id), workId: asStr(ev.work_id), roomId: room(ev.room_id, ev.chat_url) };
  if (name !== "notification.created") return null;
  const data = asDict(asDict(ev.notification).data);
  const inner = asStr(data.event);
  if (inner.startsWith("order_") && data.order_id) return { kind: "other", orderId: asStr(data.order_id), workId: asStr(data.work_id), roomId: asStr(data.room_id) };
  if (inner === "payment_paid" && asStr(data.target_type) === "marketplace_order") return { kind: "other", orderId: asStr(data.target_id), workId: "", roomId: "" };
  if (!inner.startsWith("marketplace_")) return null;
  const kind = /approved|order_paid/.test(inner) ? "paid" : inner === "marketplace_purchase_rejected" ? "rejected" : inner === "marketplace_purchase_requested" ? "requested" : "other";
  return { kind, orderId: asStr(data.order_id), workId: asStr(data.work_id), roomId: asStr(data.room_id) };
}
