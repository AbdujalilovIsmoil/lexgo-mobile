import { StyleSheet, View } from "react-native";
import { useT } from "@/shared/i18n";
import { useSom } from "@/shared/lib/sel";
import { Text } from "@/shared/ui";
import { ConfigCard } from "./ConfigCard";
import { PriceExplanation } from "./PriceExplanation";
import type { ServiceConfig } from "./types";

// The marketplace price of the service as the configuration gives it (TZ.md "Pricing Growth" §2, existing fields): the seller's
// price, the recommended one, the lowest listing price with the biggest allowed discount, the ceiling, and LexGo's explanation.
// 0 means "not set" and shows a dash; nothing is computed here.
export function PriceCard({ config: c }: { config: ServiceConfig }) {
  const { t } = useT();
  const som = useSom();
  const off = c.maxDiscountPercent !== null && c.maxDiscountPercent > 0 ? t("scfg.priceDiscount", { pct: c.maxDiscountPercent }) : "";
  const rows = [
    { key: "selected", label: t("scfg.priceSelected"), value: c.selectedPrice, hint: "" },
    { key: "recommended", label: t("scfg.priceRecommended"), value: c.recommendedPrice, hint: "" },
    { key: "min", label: t("scfg.priceMin"), value: c.minimumListingPrice, hint: off },
    { key: "max", label: t("scfg.priceMax"), value: c.maximumPrice, hint: "" },
  ];
  return (
    <ConfigCard title={t("scfg.priceTitle")}>
      {rows.map((r) => (
        <View key={r.key} style={s.row} accessible accessibilityLabel={[`${r.label}: ${r.value ? som(r.value) : "—"}`, r.hint].filter(Boolean).join(", ")}>
          <View style={s.flex}>
            <Text variant="small" tone="gray">{r.label}</Text>
            {r.hint ? <Text variant="caption" tone="gray2">{r.hint}</Text> : null}
          </View>
          <Text variant="small" weight="bold">{r.value ? som(r.value) : "—"}</Text>
        </View>
      ))}
      <PriceExplanation text={c.priceExplanation} lines={c.priceExplanationLines} />
    </ConfigCard>
  );
}

const s = StyleSheet.create({ row: { flexDirection: "row", alignItems: "center", gap: 10, minHeight: 32 }, flex: { flex: 1 } });
