export type RefundPhase = "waiting" | "approved" | "rejected";
export type RefundEntry = { phase: RefundPhase; orderId: string };
export type RefundMap = Record<string, RefundEntry>;

// A refund was requested: it now waits for the Telegram approval (nothing is refunded by the operator alone).
export const startRefund = (cur: RefundMap, requestId: string, orderId: string): RefundMap => ({ ...cur, [requestId]: { phase: "waiting", orderId } });

// `marketplace.refund_approved|rejected` arrived. `keys` are the request/order ids the event carried; an event without
// any id settles every refund that is still waiting.
export function settleRefunds(cur: RefundMap, phase: "approved" | "rejected", keys: string[]): RefundMap {
  const out: RefundMap = {};
  for (const [id, e] of Object.entries(cur)) {
    const hit = e.phase === "waiting" && (!keys.length || keys.includes(id) || keys.includes(e.orderId));
    out[id] = hit ? { ...e, phase } : e;
  }
  return out;
}
