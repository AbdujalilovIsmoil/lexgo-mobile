import { asDict, asNum, uzs } from "@/shared/lib/json";
import { MKT_STATUSES } from "../model/status";
import type { MktStats } from "../model/types";

const rank = (s: string) => {
  const i = (MKT_STATUSES as readonly string[]).indexOf(s);
  return i < 0 ? MKT_STATUSES.length : i;
};

export function normStats(v: unknown): MktStats {
  const d = asDict(v);
  const byStatus = Object.entries(asDict(d.by_status))
    .map(([status, n]) => ({ status: status.toLowerCase(), count: asNum(n) }))
    .filter((x) => x.status && x.count > 0)
    .sort((a, b) => rank(a.status) - rank(b.status) || b.count - a.count);
  return {
    ordersTotal: asNum(d.orders_total),
    paidOrders: asNum(d.paid_orders),
    activeOrders: asNum(d.active_orders),
    completedOrders: asNum(d.completed_orders),
    pendingPaymentOrders: asNum(d.pending_payment_orders),
    cancelledOrders: asNum(d.cancelled_orders),
    revenuePaid: uzs(d, "revenue_paid"),
    sellersCount: asNum(d.sellers_count),
    clientsCount: asNum(d.clients_count),
    byStatus,
  };
}
