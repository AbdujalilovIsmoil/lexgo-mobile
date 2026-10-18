import { useQueryClient } from "@tanstack/react-query";
import { supKeys } from "@/entities/admin-support";
import { asDict, asStr } from "@/shared/lib/json";
import { useUserEvents } from "@/shared/realtime";

// Supplemental payments and refunds finish elsewhere (the client pays / Telegram approves), so the socket tells us:
// every marketplace.additional_payment_* / refund_* event re-reads this ticket's client context; refund events are also
// handed over with the request/order ids they carry. No polling is added for this.
export function useAddPayLive(ticketId: string, onRefund: (phase: "approved" | "rejected", keys: string[]) => void) {
  const qc = useQueryClient();
  useUserEvents(["marketplace."], (e) => {
    const name = e.event;
    const refund = /refund_(approved|rejected)$/.exec(name);
    if (!refund && !name.startsWith("marketplace.additional_payment_")) return;
    void qc.invalidateQueries({ queryKey: supKeys.assist(ticketId) });
    if (!refund) return;
    const req = asDict(e.request);
    const keys = [e.request_id, e.additional_payment_request_id, e.order_id, req.id, req.order_id].map((x) => asStr(x)).filter(Boolean);
    onRefund(refund[1] as "approved" | "rejected", keys);
  });
}
