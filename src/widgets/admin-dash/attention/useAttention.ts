import { useMemo } from "react";
import { useAdminTasks } from "@/entities/admin-tasks";
import { usePayouts } from "@/entities/admin-payouts";
import { useSellerRequests } from "@/entities/admin-reg";

const CLOSED_TASK = ["done", "completed", "cancelled", "archived"];
const CLOSED_PAYOUT = ["paid", "cancelled", "failed", "rejected"];
const late = (due: string) => !!due && new Date(due).getTime() < Date.now();
const PENDING = { status: "pending", role: "", from: "", to: "" };

// Work waiting for an admin: pending seller requests, unpaid payouts and overdue tasks (each endpoint may fail on its own).
export function useAttention() {
  const sellers = useSellerRequests(PENDING);
  const payouts = usePayouts("");
  const tasks = useAdminTasks("");
  return useMemo(() => {
    const unpaid = (payouts.data ?? []).filter((p) => !CLOSED_PAYOUT.includes(p.status));
    const open = (tasks.data ?? []).filter((x) => !CLOSED_TASK.includes(x.status));
    const overdue = open.filter((x) => late(x.due));
    return {
      sellers: sellers.data,
      payouts: payouts.data ? { all: payouts.data, count: unpaid.length, amount: unpaid.reduce((s, p) => s + p.sellerShare, 0), items: unpaid } : undefined,
      tasks: tasks.data ? { open: open.length, overdue: overdue.length, items: overdue, total: (tasks.data ?? []).length, all: tasks.data } : undefined,
      loading: sellers.isLoading || payouts.isLoading || tasks.isLoading,
    };
  }, [sellers.data, sellers.isLoading, payouts.data, payouts.isLoading, tasks.data, tasks.isLoading]);
}
