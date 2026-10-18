import type { Drill, DrillRow } from "@/entities/admin-dash";
import type { CeoCtx } from "../lib/useCeoCtx";
import { channelBars, kv, ratio, unitEcon } from "./core";

export const drillCac = (x: CeoCtx): Drill => {
  const { t, fmt, c } = x;
  return {
    title: t("admCeo.kpi.cac"), value: fmt.money(c?.cac),
    sections: [kv(t("admDashB.drill.cac"), [
      { label: t("admDashB.drill.cacClient"), value: fmt.money(c?.cacClient) }, { label: t("admDashB.drill.cacAdvocate"), value: fmt.money(c?.cacAdvocate) },
      { label: t("admCeo.kpi.ltv"), value: fmt.money(c?.ltv) }, { label: t("admCeo.kpi.ltvCac"), value: ratio(x) },
    ]), channelBars(x)],
  };
};

export const drillGifts = (x: CeoCtx): Drill => {
  const { t, fmt } = x;
  const g = x.c?.giftKpis;
  return {
    title: t("admCeo.kpi.giftTitle"), value: String(g?.giftPurchases ?? 0),
    sections: [kv(t("admDashB.drill.gifts"), [
      { label: t("admCeo.kpi.giftActivation"), value: fmt.pct(g?.giftActivationRate) }, { label: t("admCeo.kpi.giftToPaid"), value: fmt.pct(g?.giftToPaidConversion) }, { label: t("admCeo.kpi.avgGift"), value: fmt.money(g?.averageGiftValue) },
      { label: t("admCeo.kpi.recipientConversion"), value: fmt.pct(g?.recipientConversion) }, { label: t("admCeo.kpi.giftReferralRate"), value: fmt.pct(g?.referralRate) }, { label: t("admCeo.kpi.giftCac"), value: fmt.money(g?.giftCac) }, { label: t("admCeo.kpi.giftLtv"), value: fmt.money(g?.giftLtv) },
    ])],
  };
};

// A single KPI tile with the unit-economics block (or its own facts) underneath.
export const simple = (title: string, value: string, rows?: DrillRow[]) => (x: CeoCtx): Drill => ({
  title, value, sections: [rows ? kv(x.t("admCeo.kpi.title"), rows) : unitEcon(x)],
});
