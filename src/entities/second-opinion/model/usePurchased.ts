import { useEffect } from "react";
import { postPromoEvent } from "../api/soApi";
import { useOriginStore, type Origin } from "./originStore";

// What the backend reports once the payment of the request is approved (never decided on the client): same words as the payment note.
const PAID = ["paid", "approved", "confirmed", "completed"];

type Req = { id: string; payment: { status: string } | null };

export const isPaidStatus = (s: string): boolean => PAID.includes(s.toLowerCase());

// `purchased` goes once per request, only when the backend shows the request as paid and only for a request that came from the promotion.
export const shouldSendPurchased = (req: Req, origin: Origin | undefined): boolean => !!origin && !origin.purchased && !!req.payment && isPaidStatus(req.payment.status);

// Call it where requests are on screen (the detail page, the list). The mark is set before the send and undone if the send fails, so a
// re-render never sends twice and a failed send is tried again next time.
export function useSecondOpinionPurchased(reqs: Req[]): void {
  const items = useOriginStore((s) => s.items);
  const mark = useOriginStore((s) => s.markPurchased);
  useEffect(() => {
    for (const r of reqs) {
      const o = items[r.id];
      if (!o || !shouldSendPurchased(r, o)) continue;
      mark(r.id, true);
      void postPromoEvent({ eventUrl: o.eventUrl, orderId: o.orderId, placement: o.placement, session: o.session }, "purchased", { surface: "urgent_request", request_id: r.id }).then((ok) => { if (!ok) mark(r.id, false); });
    }
  }, [reqs, items, mark]);
}
