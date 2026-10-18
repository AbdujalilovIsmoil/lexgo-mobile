import { http } from "@/shared/api";

export const DECLINE_REASONS = ["busy", "not_my_specialization", "region_far", "price_mismatch", "documents_insufficient", "conflict_of_interest"] as const;
export type DeclineReason = (typeof DECLINE_REASONS)[number];

// POST /orders/{id}/accept — only a yurist/advokat may call it.
export async function acceptOrder(orderId: string): Promise<void> {
  await http(`/orders/${orderId}/accept`, { method: "POST" });
}

// POST /orders/{id}/decline with one of the backend's reasons.
export async function declineOrder(orderId: string, reason: DeclineReason): Promise<void> {
  await http(`/orders/${orderId}/decline`, { method: "POST", body: { reason } });
}
