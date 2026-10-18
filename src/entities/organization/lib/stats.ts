import type { OwnerStats, WorkItem } from "../model/workTypes";

const DONE = new Set(["completed", "closed", "result_ready"]);
const PAID = new Set(["paid", "succeeded", "success"]);

export const isDone = (w: WorkItem) => DONE.has(w.status);
export const isPaid = (w: WorkItem) => PAID.has(w.paymentStatus);

// Revenue = price of paid orders; "completed" = completed / closed orders.
export function summarize(items: WorkItem[], total: number): OwnerStats {
  const out: OwnerStats = { orders: total, completed: 0, cancelled: 0, revenue: 0, sampled: items.length, truncated: total > items.length, paid: [], byMember: {} };
  for (const w of items) {
    const m = (out.byMember[w.memberUserId] ??= { orders: 0, completed: 0, revenue: 0 });
    m.orders += 1;
    if (isDone(w)) {
      out.completed += 1;
      m.completed += 1;
    }
    if (w.status === "cancelled" || w.status === "declined") out.cancelled += 1;
    if (isPaid(w)) {
      out.revenue += w.amount;
      m.revenue += w.amount;
      out.paid.push(w);
    }
  }
  out.paid.sort((a, b) => b.amount - a.amount);
  return out;
}

// An active case / urgent request past its deadline.
export const isOverdue = (w: WorkItem, now = Date.now()) => {
  const t = w.deadlineAt ? new Date(w.deadlineAt).getTime() : NaN;
  return Number.isFinite(t) && t < now && !isDone(w) && w.status !== "cancelled";
};
