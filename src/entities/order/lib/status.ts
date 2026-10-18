import type { Order } from "../model/types";

// Statuses after a seller has taken the order (mirrors TAKEN_ORDER_STATUSES on the web).
const TAKEN = new Set([
  "accepted", "declined", "rejected", "paid", "started", "in_progress", "result_ready", "quality_check",
  "delivered", "client_confirmation", "completed", "rated", "lost", "cancelled", "canceled", "closed", "done",
]);
const DROPPED = new Set(["declined", "rejected", "lost", "cancelled", "canceled"]);

const unpaidMarketplace = (o: Order) => (o.source ?? "").toLowerCase() === "marketplace" && o.status === "pending_payment";

// Still open for a seller to take.
export const isOpenOrder = (o: Order): boolean => !TAKEN.has(o.status) && !unpaidMarketplace(o);
// Taken and still relevant: shows up under "my work".
export const isTakenOrder = (o: Order): boolean => TAKEN.has(o.status) && !DROPPED.has(o.status);
