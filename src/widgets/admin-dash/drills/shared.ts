import type { DrillRow, DrillSection, Point } from "@/entities/admin-dash";
import type { DashCtx } from "../lib/useDashCtx";

// Bars section from labelled points: `name` turns the slug into a label.
export const barsOf = (x: DashCtx, title: string, pts: Point[], name: (k: string) => string, empty?: string): DrillSection => ({
  kind: "bars", title, rows: pts.map((p): DrillRow => ({ label: name(p.label), value: x.fmt.int(p.value), n: p.value })), empty,
});
export const revenueSeries = (x: DashCtx): DrillSection => ({ kind: "series", title: x.t("admDashB.drill.trend"), points: x.trend, format: x.fmt.money });
