import { ApiError, http } from "@/shared/api";
import { asDict, asStr } from "@/shared/lib/json";
import { listOf, normMilestone, normOrder, normStep } from "./normalize";
import type { Milestone, OrderStep, ProOrder } from "../model/types";

const enc = encodeURIComponent;

// role_view=seller → only the orders this seller owns; unpaid ones are not served (TZ 18).
const listSellerOrders = async (): Promise<ProOrder[]> =>
  listOf(await http("/marketplace/me/orders?role_view=seller"), "items", "data").map(normOrder).filter((o) => o.id);

// Orders assigned to this seller and still waiting for their answer: the seller list (role_view=seller) leaves them out, while GET /orders
// has them and the order detail opens for the seller — so they are read from there and put first, exactly as the web's "Xizmat buyurtmalari"
// (law: listSellerAssignments). A failure here never hides the rest.
const SELLER_WAITING = new Set(["sent_to_seller", "awaiting_seller", "assigned", "seller_assigned"]);
async function listSellerAssignments(known: ReadonlySet<string>): Promise<ProOrder[]> {
  const d = await http("/orders");
  const rows = listOf(d, "orders", "items", "data").map((r) => asDict(r));
  const ids = rows
    .filter((r) => asStr(r.source).toLowerCase() === "marketplace" && SELLER_WAITING.has(asStr(r.status).toLowerCase()) && !known.has(asStr(r.id)))
    .map((r) => asStr(r.id))
    .filter(Boolean)
    .slice(0, 20);
  const got = await Promise.allSettled(ids.map((id) => http(`/marketplace/me/orders/${enc(id)}`)));
  return got.flatMap((g) => (g.status === "fulfilled" ? [normOrder(asDict(g.value).order ?? g.value)] : [])).filter((o) => o.id);
}

// The seller's orders as the web lists them: the new assignments waiting for an answer first, then GET /marketplace/me/orders?role_view=seller.
export async function listOrders(): Promise<ProOrder[]> {
  const base = await listSellerOrders();
  const extra = await listSellerAssignments(new Set(base.map((o) => o.id))).catch(() => [] as ProOrder[]);
  return [...extra, ...base];
}

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

