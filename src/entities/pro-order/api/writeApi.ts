import { http } from "@/shared/api";

const enc = encodeURIComponent;

// POST /marketplace/me/orders/{id}/additional-payment-request - Studio option ids + a note (TZ 11).
export const requestAdditional = (id: string, optionIds: string[], note: string) =>
  http(`/marketplace/me/orders/${enc(id)}/additional-payment-request`, { method: "POST", body: { selected_option_ids: optionIds, note: note.trim() } });
