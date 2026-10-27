import { ApiError, http } from "@/shared/api";
import { listOf, normMilestone, normOrder, normStep } from "./normalize";
import type { Milestone, OrderStep, ProOrder } from "../model/types";

const enc = encodeURIComponent;

// role_view=seller → only the orders this seller owns; unpaid ones are not served (TZ 18).
export const listOrders = async (): Promise<ProOrder[]> =>
  listOf(await http("/marketplace/me/orders?role_view=seller"), "items", "data").map(normOrder).filter((o) => o.id);

// One order read fresh (TZ §5, §14: a push opens the order by id and it is refetched before rendering). null = not this seller's.
export async function getOrder(id: string): Promise<ProOrder | null> {
  try {
    const o = normOrder(await http(`/marketplace/me/orders/${enc(id)}`));
    return o.id ? o : null;
  } catch (e) {
    if (e instanceof ApiError && (e.status === 404 || e.status === 403)) return null;
    throw e;
  }
}

export const getHistory = async (id: string): Promise<OrderStep[]> => listOf(await http(`/orders/${enc(id)}/status-history`), "items", "data").map(normStep);

export const getMilestones = async (id: string): Promise<Milestone[]> => listOf(await http(`/orders/${enc(id)}/milestones`), "items", "data").map(normMilestone);

export const acceptOrder = (id: string) => http(`/orders/${enc(id)}/accept`, { method: "POST" });

// POST /orders/{id}/decline: {reason_code, reason_text} of the Enterprise contract §4, plus the web's older {reason, note} so either
// backend reads the seller's words.
export const declineOrder = (id: string, reason: string, note = "") => {
  const text = note.trim();
  return http(`/orders/${enc(id)}/decline`, { method: "POST", body: { reason_code: reason, reason_text: text || undefined, reason: text || reason, note: text || undefined } });
};

