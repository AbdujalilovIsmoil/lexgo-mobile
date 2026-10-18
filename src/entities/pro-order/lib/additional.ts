import type { AdditionalPay } from "../model/extraTypes";

const OPEN = new Set(["pending", "pending_payment", "waiting_payment", "awaiting_payment", "requested", "escalated"]);

export const additionalOpen = (a: AdditionalPay | null): boolean => !!a && OPEN.has(a.status);

// TZ 11: a supplemental request moves the order to `waiting_payment` and pauses the work until it is approved.
export const isPaused = (o: { status: string; additional?: AdditionalPay | null }): boolean => o.status === "waiting_payment" || additionalOpen(o.additional ?? null);
