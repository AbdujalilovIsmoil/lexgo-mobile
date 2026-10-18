import type { Drill } from "@/entities/admin-dash";
import { KpiGrid, KpiTile, SectionCard } from "@/shared/ui/admin";
import type { CeoCtx } from "./lib/useCeoCtx";
import { drillGifts } from "./drills/more";

// Gift-program KPIs; all tiles open the same gift breakdown.
export function CeoGifts({ x, onOpen }: { x: CeoCtx; onOpen: (d: Drill) => void }) {
  const { t, fmt, regionHint: reg } = x;
  const g = x.c?.giftKpis;
  const open = () => onOpen(x.withDemo(drillGifts(x)));
  return (
    <SectionCard title={t("admCeo.kpi.giftTitle")}>
      <KpiGrid>
        <KpiTile icon="gift" label={t("admCeo.kpi.giftPurchases")} value={fmt.int(g?.giftPurchases)} hint={reg} onPress={open} />
        <KpiTile icon="zap" label={t("admCeo.kpi.giftActivation")} value={fmt.pct(g?.giftActivationRate)} hint={reg} onPress={open} />
        <KpiTile icon="trending-up" tint="#22C55E" label={t("admCeo.kpi.giftToPaid")} value={fmt.pct(g?.giftToPaidConversion)} hint={reg} onPress={open} />
        <KpiTile icon="credit-card" label={t("admCeo.kpi.avgGift")} value={fmt.moneyOrDash(g?.averageGiftValue)} hint={reg} onPress={open} />
        <KpiTile icon="target" label={t("admCeo.kpi.recipientConversion")} value={fmt.pct(g?.recipientConversion)} hint={reg} onPress={open} />
        <KpiTile icon="share-2" label={t("admCeo.kpi.giftReferralRate")} value={fmt.pct(g?.referralRate)} hint={reg} onPress={open} />
        <KpiTile icon="credit-card" label={t("admCeo.kpi.giftCac")} value={fmt.moneyOrDash(g?.giftCac)} hint={reg} onPress={open} />
        <KpiTile icon="trending-up" tint="#22C55E" label={t("admCeo.kpi.giftLtv")} value={fmt.moneyOrDash(g?.giftLtv)} hint={reg} onPress={open} />
      </KpiGrid>
    </SectionCard>
  );
}
