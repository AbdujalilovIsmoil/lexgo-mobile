import { StyleSheet, View } from "react-native";
import { buildTimeline, useStatusHistory, type MarketOrder } from "@/entities/order";
import { useColors } from "@/shared/theme";
import { Icon, SectionHeader, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { fmtDateTime, humanizeSlug } from "@/shared/lib/format";

// What happened, oldest first: backend status history when it exists, else the steps read from the order.
export function OrderTimeline({ order }: { order: MarketOrder }) {
  const c = useColors();
  const { t, locale } = useT();
  const { data } = useStatusHistory(order.id);
  const status = (s: string) => (t(`mk6.status.${s}`) !== `mk6.status.${s}` ? t(`mk6.status.${s}`) : humanizeSlug(s));
  const items = buildTimeline(order, data ?? [], { status, step: (k) => t(`mk5.tl.${k}`) });
  return (
    <View style={s.col}>
      <SectionHeader title={t("mk4.history")} />
      {items.map((it, i) => {
        const tone = it.state === "fail" ? c.err : it.state === "now" ? c.accent : c.ok;
        return (
          <View key={it.key} style={s.row}>
            <View style={s.rail}>
              <View style={[s.dot, { backgroundColor: tone }]}><Icon name={it.state === "fail" ? "x" : it.state === "now" ? "clock" : "check"} size={12} color="#fff" /></View>
              {i < items.length - 1 ? <View style={[s.line, { backgroundColor: c.line }]} /> : null}
            </View>
            <View style={s.txt}>
              <Text variant="small" weight="bold">{it.label}</Text>
              {it.at ? <Text variant="caption" tone="gray2">{fmtDateTime(it.at, locale)}</Text> : null}
              {it.note ? <Text variant="caption" tone="gray">{it.note}</Text> : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  col: { gap: 6 },
  row: { flexDirection: "row", gap: 12 },
  rail: { alignItems: "center", width: 22 },
  dot: { width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  line: { flex: 1, width: 2, marginVertical: 3 },
  txt: { flex: 1, gap: 1, paddingBottom: 14 },
});
