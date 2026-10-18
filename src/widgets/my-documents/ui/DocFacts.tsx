import { StyleSheet, View } from "react-native";
import { Text } from "@/shared/ui";
import { radius, useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { fmtDate, fmtDateTime } from "@/shared/lib/format";
import { fmtMoney } from "@/shared/lib/money";
import type { Fact } from "@/entities/my-document";

// The key-facts grid of the detail sheet: two tiles per row, a small label over a short value.
export function DocFacts({ facts }: { facts: Fact[] }) {
  const { t, locale } = useT();
  const c = useColors();
  const value = (f: Fact): string => {
    if (f.iso) return f.key === "created" ? fmtDateTime(f.iso, locale) : fmtDate(f.iso, locale);
    if (f.key === "price") {
      const money = f.amount && f.amount > 0 ? `${fmtMoney(f.amount)} ${t("adm.currency")}` : "";
      return [money, t(`docSheet.price.${f.price}`)].filter(Boolean).join(" · ");
    }
    if (f.key === "versions") return t("docSheet.nVersions", { n: f.n ?? 0 });
    if (f.key === "language") return (f.text ?? "").toUpperCase();
    return f.n !== undefined ? String(f.n) : f.text ?? "";
  };
  return (
    <View style={s.grid}>
      {facts.map((f) => (
        <View key={f.key} style={[s.tile, { borderColor: c.line }]} accessible accessibilityLabel={`${t(`docSheet.fact.${f.key}`)}: ${value(f)}`}>
          <Text variant="caption" tone="gray" numberOfLines={1}>{t(`docSheet.fact.${f.key}`)}</Text>
          <Text variant="small" weight="semibold" numberOfLines={2}>{value(f)}</Text>
        </View>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  tile: { flexBasis: "47%", flexGrow: 1, gap: 3, padding: 12, borderRadius: radius.r, borderWidth: 1 },
});
