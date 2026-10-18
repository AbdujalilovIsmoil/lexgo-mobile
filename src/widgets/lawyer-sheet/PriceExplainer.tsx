import { StyleSheet, View } from "react-native";
import { usePricingPolicy, type LawyerService } from "@/entities/lawyer";
import { SheetBack, Skeleton, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { fmtMoney } from "@/shared/lib/money";
import { ExplainStep } from "./ExplainStep";
import { experienceLine, premiumLines, regionLine } from "./explainLines";

// "How is the price set?" — the public pricing rules, with the picked service's numbers.
export function PriceExplainer({ service, onBack }: { service: LawyerService | null; onBack: () => void }) {
  const { t } = useT();
  const { data: p, isLoading } = usePricingPolicy(true);
  const premium = p ? premiumLines(p, t) : [];
  return (
    <View style={s.col}>
      <SheetBack onPress={onBack} />
      <Text variant="h3">{t("mk2.explain.title")}</Text>
      <Text variant="small" tone="gray">{t("mk2.explain.lead")}</Text>
      {service && service.basePrice > 0 && service.price > 0 ? <Text variant="small" weight="semibold">{t("mk2.explain.selected", { service: service.title, base: fmtMoney(service.basePrice), price: fmtMoney(service.price) })}</Text> : null}
      {isLoading ? [0, 1, 2].map((i) => <Skeleton key={i} height={52} round={14} />) : (
        <>
          <ExplainStep icon="tag" title={t("mk2.explain.baseT")} lines={[t("mk2.explain.baseD")]} />
          <ExplainStep icon="map-pin" title={t("mk2.explain.regionT")} lines={[(p && regionLine(p, t)) || t("mk2.explain.regionD")]} />
          <ExplainStep icon="briefcase" title={t("mk2.explain.expT")} lines={[(p && experienceLine(p, t)) || t("mk2.explain.expD")]} />
          <ExplainStep icon="star" title={t("mk2.explain.premiumT")} lines={premium.length ? premium : [t("mk2.explain.premiumD")]} />
          <ExplainStep icon="sliders" title={t("mk2.explain.rangeT")} lines={[p ? t("mk2.explain.rangeP", { min: p.minPercent, max: p.maxPercent }) : t("mk2.explain.rangeD")]} />
        </>
      )}
      <Text variant="caption" tone="gray2">{t("mk2.explain.foot")}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  col: { gap: 14 },
});
