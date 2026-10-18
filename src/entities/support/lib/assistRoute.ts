import type { AssistInfo } from "../model/assistTypes";

const enc = encodeURIComponent;

/** App route that shows the real object behind an assist card (the server is the source of truth there). */
export function assistRoute(i: AssistInfo): string {
  switch (i.kind) {
    case "subscription_preview": return "/subscription";
    case "subscription_checkout": return i.paymentId ? `/payments/${enc(i.paymentId)}` : "/payments";
    case "document_request": return i.targetId ? `/documents/${enc(i.targetId)}` : "/documents";
    case "marketplace_purchase": return i.targetId ? `/orders/${enc(i.targetId)}` : "/orders";
    case "urgent_advokat": return i.targetId ? `/urgent/${enc(i.targetId)}` : "/urgent";
  }
}

// The only decline the backend offers a client is cancelling their own unpaid marketplace order.
export const canDecline = (i: AssistInfo): boolean => i.kind === "marketplace_purchase" && i.targetId !== "" && i.pay === "pending";
