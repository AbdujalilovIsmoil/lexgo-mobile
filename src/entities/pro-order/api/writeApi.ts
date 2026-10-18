import { http } from "@/shared/api";
import { completionBody } from "../lib/complete";
import type { ResultFile } from "../model/extraTypes";

const enc = encodeURIComponent;

// POST /marketplace/me/orders/{id}/complete - result text and/or files (TZ 13); an empty one never leaves the phone.
export async function completeOrder(id: string, text: string, files: ResultFile[]): Promise<void> {
  const body = completionBody(text, files);
  if (!body) throw new Error("ntd.bz.marketplace_result_required");
  await http(`/marketplace/me/orders/${enc(id)}/complete`, { method: "POST", body });
}

// POST /marketplace/me/orders/{id}/additional-payment-request - Studio option ids + a note (TZ 11).
export const requestAdditional = (id: string, optionIds: string[], note: string) =>
  http(`/marketplace/me/orders/${enc(id)}/additional-payment-request`, { method: "POST", body: { selected_option_ids: optionIds, note: note.trim() } });
