import { StyleSheet, View } from "react-native";
import type { PriceComponent, PriceSnapshot } from "@/entities/market-flow";
import { Text } from "@/shared/ui";
import { SectionCard } from "@/shared/ui/admin";
import { fmtMoney } from "@/shared/lib/money";
import { useLocaleStore, useT } from "@/shared/i18n";

// "Why this price?" ("Transparent price explanation" §2): the order's own pricing snapshot, each component in the backend's order with
// its explanation in the app's language, and the backend's final price — nothing is added up or recalculated on the phone. The same card
// serves the client and the seller.
export function PriceCard({ price }: { price: PriceSnapshot }) {
  const { t } = useT();
  const locale = useLocaleStore((s) => s.locale);
  const cur = price.currency === "UZS" ? t("common.currency") : price.currency;
  const money = (n: number) => `${n < 0 ? "−" : ""}${fmtMoney(Math.abs(n))} ${cur}`;
  const label = (c: PriceComponent) => {
    const own = c.explanation[locale] || c.explanation.uz || c.explanation.ru || c.explanation.en;
    if (own) return own;
    const key = `mf.price.code.${c.code}`;
    return t(key) === key ? c.code.replace(/_/g, " ") : t(key);
  };
  return (
    <SectionCard title={t("mf.price.title")}>
      <View style={s.col}>
        {price.components.map((c, i) => (
          <View key={`${c.code}-${c.optionId}-${i}`} style={s.row}>
            <Text variant="small" tone="gray" style={s.flex}>{label(c)}</Text>
            <Text variant="small" weight="bold">{money(c.amount)}</Text>
          </View>
        ))}
        <View style={s.row}>
          <Text variant="small" weight="bold" style={s.flex}>{t("mf.price.total")}</Text>
          <Text variant="small" weight="bold" tone="accent">{money(price.finalPrice)}</Text>
        </View>
        {price.historical ? <Text variant="caption" tone="gray2">{t("mf.price.historical")}</Text> : null}
      </View>
    </SectionCard>
  );
}

const s = StyleSheet.create({ col: { gap: 8 }, row: { flexDirection: "row", gap: 10 }, flex: { flex: 1 } });
