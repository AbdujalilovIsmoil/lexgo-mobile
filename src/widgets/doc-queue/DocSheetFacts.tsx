import { StyleSheet, View } from "react-native";
import { Text } from "@/shared/ui";
import { radius, useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { fmtDate, fmtDateTime, timeAgo } from "@/shared/lib/format";
import type { Fact } from "@/entities/doc-queue";

// The key-facts grid of the request sheet: two tiles per row, a small label over a short value (a late wait turns warn).
export function DocSheetFacts({ facts }: { facts: Fact[] }) {
  const { t, locale } = useT();
  const c = useColors();
  const value = (f: Fact): string => {
    if (f.key === "waiting") return f.late ? t("proDocSheet.late", { ago: timeAgo(f.iso, t) }) : timeAgo(f.iso, t);
    if (f.key === "created") return fmtDateTime(f.iso, locale);
    if (f.iso) return fmtDate(f.iso, locale);
    return f.n !== undefined ? String(f.n) : f.text ?? "";
  };
  return (
    <View style={s.grid}>
      {facts.map((f) => (
        <View key={f.key} style={[s.tile, { borderColor: c.line, backgroundColor: c.surface }]} accessible accessibilityLabel={`${t(`proDocSheet.fact.${f.key}`)}: ${value(f)}`}>
          <Text variant="caption" tone="gray" numberOfLines={1}>{t(`proDocSheet.fact.${f.key}`)}</Text>
          <Text variant="small" weight="semibold" numberOfLines={2} style={f.late ? { color: c.warn } : undefined}>{value(f)}</Text>
        </View>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  tile: { flexBasis: "47%", flexGrow: 1, gap: 3, padding: 12, borderRadius: radius.r, borderWidth: 1 },
});
