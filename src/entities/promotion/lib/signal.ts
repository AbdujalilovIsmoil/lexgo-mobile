import { asDict, asStr } from "@/shared/lib/json";
import type { PendingPromo } from "../model/types";

export type PromoSignal = { kind: "approved" | "rejected"; requestId: string; serviceId: string };

const kindOf = (name: string): PromoSignal["kind"] | null => (name.endsWith("approved") ? "approved" : name.endsWith("rejected") ? "rejected" : null);

// `promotion.checkout_approved|rejected`, either pushed directly or inside a notification.created.
export function signalOf(ev: { event: string } & Record<string, unknown>): PromoSignal | null {
  const direct = ev.event.startsWith("promotion.checkout_");
  const data = direct ? ev : asDict(asDict(ev.notification).data);
  const name = direct ? ev.event : asStr(data.event);
  if (!name.startsWith("promotion.checkout_")) return null;
  const kind = kindOf(name);
  return kind ? { kind, requestId: asStr(data.request_id ?? data.checkout_request_id), serviceId: asStr(data.service_id) } : null;
}

export const matches = (p: PendingPromo, s: PromoSignal): boolean =>
  (!!s.requestId && p.requestId === s.requestId) || (!s.requestId && !!s.serviceId && p.target === `service:${s.serviceId}`);

export const PENDING_TTL = 72 * 3600 * 1000;
