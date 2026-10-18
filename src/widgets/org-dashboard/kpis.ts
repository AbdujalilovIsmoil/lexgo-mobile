import type { IconName } from "@/shared/ui";
import { isOverdue, type Dashboard, type WorkItem } from "@/entities/organization";

export type KpiKind = "members" | "orders" | "cases" | "urgent" | "overdue" | "completed" | "revenue";

export const KPI_ICON: Record<KpiKind, IconName> = { members: "users", orders: "shopping-bag", cases: "briefcase", urgent: "zap", overdue: "alert-triangle", completed: "check-circle", revenue: "trending-up" };
export const KPI_TINT: Record<KpiKind, string> = { members: "#3B82F6", orders: "#6366F1", cases: "#8B5CF6", urgent: "#F59E0B", overdue: "#EF4444", completed: "#22C55E", revenue: "#0EA5A4" };

// Active work that is past its deadline (cases and urgent requests carry deadlines).
export const overdueOf = (d: Dashboard): WorkItem[] => [...d.cases, ...d.urgent, ...d.orders].filter((w) => isOverdue(w));

// The dashboard's own lists behind a tile (completed and revenue come from the workload endpoint).
export function itemsOf(d: Dashboard, k: KpiKind): WorkItem[] {
  if (k === "orders") return d.orders;
  if (k === "cases") return d.cases;
  if (k === "urgent") return d.urgent;
  return k === "overdue" ? overdueOf(d) : [];
}
