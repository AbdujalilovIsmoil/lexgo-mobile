import { StyleSheet, View } from "react-native";
import { priceGauge, type ProService } from "@/entities/pro-service";
import { fmtMoney } from "@/shared/lib/money";
import { useSom } from "@/shared/lib/sel";
import { useColors } from "@/shared/theme";
import { Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";

// The price in use as a big number and a bar: where it sits inside the allowed corridor (min … max), with the recommended price
// marked. Above the maximum the bar turns amber (the client then pays the capped price).
export function PriceGauge({ item }: { item: ProService }) {
  const { t } = useT();
  const c = useColors();
  const som = useSom();
  const g = priceGauge(item);
  const tone = g?.over ? c.warn : c.accent;
  return (
    <View style={[s.card, { backgroundColor: c.surface, borderColor: c.line }]}>
      <Text variant="caption" tone="gray" weight="bold">{item.selectedPrice ? t("proSvc.sheet.yourPrice") : t("proSvc.card.catalogPrice")}</Text>
      <Text variant="h2">{item.effectivePrice ? som(item.effectivePrice) : t("proSvc.form.noPriceTag")}</Text>
      {g ? (
        <View style={s.gauge} accessible accessibilityLabel={t("proSvc.card.band", { min: fmtMoney(g.min), max: fmtMoney(g.max) })}>
          <View style={[s.track, { backgroundColor: c.surface2 }]}>
            <View style={[s.fill, { width: `${Math.round(g.at * 100)}%`, backgroundColor: tone }]} />
            {g.recommended !== null ? <View style={[s.tick, { left: `${Math.round(((g.recommended - g.min) / (g.max - g.min)) * 100)}%`, backgroundColor: c.ink }]} /> : null}
          </View>
          <View style={s.ends}>
            <Text variant="caption" tone="gray">{fmtMoney(g.min)}</Text>
            {g.recommended !== null ? <Text variant="caption" tone="gray2">{t("proSvc.sheet.recommended", { price: fmtMoney(g.recommended) })}</Text> : null}
            <Text variant="caption" tone="gray">{fmtMoney(g.max)}</Text>
          </View>
          {g.over ? <Text variant="caption" style={{ color: c.warn }}>{t("proSvc.card.cappedHint", { price: fmtMoney(g.value) })}</Text> : null}
        </View>
      ) : (
        <Text variant="caption" tone="gray">{t(item.catalogPrice || item.effectivePrice ? "proSvc.card.bandUnknown" : "proSvc.card.bandNone")}</Text>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  card: { gap: 4, padding: 16, borderRadius: 20, borderWidth: 1 },
  gauge: { gap: 6, marginTop: 10 },
  track: { height: 8, borderRadius: 4, justifyContent: "center" },
  fill: { height: 8, borderRadius: 4 },
  tick: { position: "absolute", width: 2, height: 16, top: -4, marginLeft: -1, borderRadius: 1 },
  ends: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 },
});
