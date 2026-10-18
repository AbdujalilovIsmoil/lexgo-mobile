import { StyleSheet, View } from "react-native";
import { PressableScale, Text } from "@/shared/ui";
import { SectionCard } from "@/shared/ui/admin";
import type { CeoCtx } from "../lib/useCeoCtx";

// One stacked bar of the new users of the period: clients vs advocates vs lawyers, with a legend.
export function GrowthBar({ x, onPress }: { x: CeoCtx; onPress: () => void }) {
  const { t, fmt, c } = x;
  const parts = [
    { key: "c", label: t("admCeo.kpi.newClients"), n: c?.newClients ?? 0, color: "#3B82F6" },
    { key: "a", label: t("admDashB.drill.newAdvocates"), n: c?.newAdvocates ?? 0, color: "#8B5CF6" },
    { key: "l", label: t("admDashB.drill.newLawyers"), n: c?.newLawyers ?? 0, color: "#22C55E" },
  ];
  const sum = parts.reduce((n, p) => n + p.n, 0);
  return (
    <SectionCard title={t("admDashB.drill.newUsers")}>
      <PressableScale onPress={onPress} scale={0.98} style={s.box}>
        <View style={s.bar}>{sum ? parts.filter((p) => p.n).map((p) => <View key={p.key} style={{ flex: p.n, backgroundColor: p.color }} />) : null}</View>
        <View style={s.legend}>
          {parts.map((p) => (
            <View key={p.key} style={s.item}>
              <View style={[s.dot, { backgroundColor: p.color }]} />
              <Text variant="caption" tone="gray" numberOfLines={1} style={s.fill}>{p.label}</Text>
              <Text variant="small" weight="bold">{fmt.int(p.n)}</Text>
            </View>
          ))}
        </View>
      </PressableScale>
    </SectionCard>
  );
}

const s = StyleSheet.create({ box: { gap: 12 }, bar: { flexDirection: "row", height: 14, borderRadius: 7, overflow: "hidden", backgroundColor: "rgba(128,140,160,0.18)", gap: 2 }, legend: { gap: 8 }, item: { flexDirection: "row", alignItems: "center", gap: 8 }, dot: { width: 10, height: 10, borderRadius: 5 }, fill: { flex: 1 } });
