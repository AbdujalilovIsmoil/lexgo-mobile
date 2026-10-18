import type { Drill, DrillRow, DrillSection } from "@/entities/admin-dash";
import type { CeoCtx } from "../lib/useCeoCtx";

export const kv = (title: string | undefined, rows: DrillRow[]): DrillSection => ({ kind: "kv", title, rows });
export const ratio = (x: CeoCtx) => (x.c?.ltvCac ? `${x.c.ltvCac}×` : "—");

export const channelBars = (x: CeoCtx): DrillSection => ({
  kind: "bars", title: x.t("admCeo.channels"),
  rows: (x.c?.channels ?? []).map((ch) => ({ label: x.label.source(ch.name), value: x.fmt.money(ch.revenue), n: ch.revenue, sub: `${ch.leads} · ${ch.payments} · ${ch.pct}%` })),
});
export const funnelBars = (x: CeoCtx): DrillSection => ({
  kind: "bars", title: x.t("admCeo.funnel"), rows: (x.c?.funnel ?? []).map((f) => ({ label: x.label.stage(f.label), value: String(f.value), n: f.value })),
});
// GMV / ARR / ARPU / take rate / CAC / LTV in one fact block (the "unit economics").
export const unitEcon = (x: CeoCtx): DrillSection => {
  const { t, fmt, c } = x;
  return kv(t("admCeo.kpi.title"), [
    { label: t("admCeo.kpi.gmv"), value: fmt.money(c?.gmv) }, { label: t("admCeo.kpi.arr"), value: fmt.money(c?.arr) }, { label: t("admCeo.kpi.arpu"), value: fmt.money(c?.arpu) }, { label: t("admCeo.kpi.takeRate"), value: fmt.pct(c?.takeRate) },
    { label: t("admCeo.kpi.cac"), value: fmt.money(c?.cac) }, { label: t("admCeo.kpi.ltv"), value: fmt.money(c?.ltv) }, { label: t("admCeo.kpi.ltvCac"), value: ratio(x) }, { label: t("admCeo.kpi.payback", { n: c?.paybackMonths ?? 0 }), value: "" },
  ]);
};
export type CeoDrill = (x: CeoCtx) => Drill;
