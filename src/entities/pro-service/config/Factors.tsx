import { StyleSheet, View } from "react-native";
import { useT } from "@/shared/i18n";
import { fmtMoney } from "@/shared/lib/money";
import { Text } from "@/shared/ui";

export type ConfigFactor = { id: string; title: string; kind: "fixed" | "percent"; value: number };
type Props = { factors: ConfigFactor[]; price?: number };

// Approximate so'm amount of a factor: fixed as is, percent of the seller's price.
export const factorAmount = (f: ConfigFactor, price = 0): number => (f.kind === "percent" ? Math.round((price * f.value) / 100) : Math.round(f.value));

// "Factors that raise the price" (config.factorsTitle/Hint): fixed amounts first, then percentages.
export function Factors({ factors, price = 0 }: Props) {
  const { t } = useT();
  if (!factors.length) return null;
  const sorted = [...factors].sort((a, b) => (a.kind === b.kind ? 0 : a.kind === "fixed" ? -1 : 1));
  return (
    <View style={s.box}>
      <Text variant="h4">{t("svcRules.cfgFactorsTitle")}</Text>
      <Text variant="caption" tone="gray">{t("svcRules.cfgFactorsHint")}</Text>
      {sorted.map((f) => {
        const label = f.kind === "fixed" ? t("svcRules.cfgFactorFixed", { amount: fmtMoney(f.value) }) : t("svcRules.cfgFactorPercent", { pct: f.value, amount: fmtMoney(factorAmount(f, price)) });
        return (
          <View key={f.id || f.title} style={s.row} accessible accessibilityLabel={`${f.title}, ${label}`}>
            <Text variant="small" style={s.flex}>{f.title}</Text>
            <Text variant="small" tone="gray" weight="semibold">{label}</Text>
          </View>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({ box: { gap: 6 }, row: { flexDirection: "row", gap: 10, minHeight: 32, alignItems: "center" }, flex: { flex: 1 } });
