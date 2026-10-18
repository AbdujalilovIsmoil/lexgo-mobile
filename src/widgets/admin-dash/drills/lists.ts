import type { DashListItem, Drill } from "@/entities/admin-dash";
import type { DashCtx } from "../lib/useDashCtx";

const listDrill = (x: DashCtx, title: string, stat: string, items: DashListItem[]): Drill => ({
  title, value: x.fmt.int(x.stat(stat) ?? items.length), sections: [{ kind: "list", rows: items.map(x.toRow) }],
});

export const drillTasks = (x: DashCtx) => listDrill(x, x.t("admDashC.metrics.tasks"), "tasks", x.d?.lists.tasks ?? []);
export const drillB2b = (x: DashCtx) => listDrill(x, x.t("admDashC.metrics.b2b"), "b2b_clients", x.d?.lists.b2bClients ?? []);
export const drillReviews = (x: DashCtx) => listDrill(x, x.t("admDashC.metrics.reviews"), "reviews", x.d?.lists.reviews ?? []);
// The overview payload only has a counter for cases; the records come from the drill-down endpoint.
export const drillCases = (x: DashCtx): Drill => ({ title: x.t("admDashC.metrics.cases"), value: x.fmt.int(x.stat("cases") ?? 0), sections: [], detail: { metric: "cases", filter: x.filter } });
