import { postPromoEvent } from "../api/soApi";
import { eventKey } from "./keys";
import { promotionSessionId } from "./session";
import type { Placement, PromoEventName } from "../model/types";

type Target = { eventUrl: string; orderId: string; placement: Placement };

// Events already sent in this app session (by their idempotency key): a re-render, a refetch or a second tap never sends one twice.
const sent = new Set<string>();

// Sends one promotion event once per (order, placement, session, event). A failed send is forgotten so a later try can send it.
export async function trackPromo(p: Target, event: PromoEventName, metadata: Record<string, unknown> = { surface: "marketplace_order_detail" }): Promise<void> {
  if (!p.eventUrl || !p.orderId) return;
  const key = eventKey(p.orderId, p.placement, promotionSessionId(), event);
  if (sent.has(key)) return;
  sent.add(key);
  if (!(await postPromoEvent(p, event, metadata))) sent.delete(key);
}

export const wasTracked = (p: Target, event: PromoEventName): boolean => sent.has(eventKey(p.orderId, p.placement, promotionSessionId(), event));
export const resetTracked = (): void => sent.clear(); // tests
