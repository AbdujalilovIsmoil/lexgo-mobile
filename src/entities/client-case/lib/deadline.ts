import { responseDeadline, type BusinessHours } from "@/entities/business-hours";

const WAITING = new Set(["new", "seller_selection", "sent_to_seller", "waiting_info"]);

// Deadline of the seller's answer for an order still waiting on it, else null.
export function orderDeadline(o: { status: string; createdAt: string } | undefined, bh: BusinessHours, now: number) {
  if (!o || !now || !WAITING.has(o.status) || !o.createdAt) return null;
  const from = new Date(o.createdAt).getTime();
  if (Number.isNaN(from)) return null;
  const at = responseDeadline(bh, from, 30);
  return { at, overdue: at < now };
}
