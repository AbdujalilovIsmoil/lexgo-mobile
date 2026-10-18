import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { gradient, radius, shadows } from "@/shared/theme";
import { Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";

// Four numbers over the list on the dark gradient: all cases, active, with a deadline due (late, today or within three days), completed.
export function CasesSummary({ total, active, soon, done }: { total: number; active: number; soon: number; done: number }) {
  const { t } = useT();
  const cells = [[total, t("mcs.total")], [active, t("mcs.active")], [soon, t("mcs.soon")], [done, t("mcs.done")]] as const;
  return (
    <LinearGradient colors={[...gradient.dark]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[s.card, shadows.s2]}>
      {cells.map(([n, label], i) => (
        <View key={label} style={[s.cell, i ? s.sep : null]}>
          <Text variant="h2" tone="white">{n}</Text>
          <Text variant="caption" numberOfLines={2} style={s.lbl}>{label}</Text>
        </View>
      ))}
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  card: { flexDirection: "row", paddingVertical: 14, borderRadius: radius.rl, overflow: "hidden" },
  cell: { flex: 1, gap: 2, paddingHorizontal: 12 },
  sep: { borderLeftWidth: 1, borderLeftColor: "rgba(255,255,255,0.18)" },
  lbl: { color: "#C4DEFF" },
});
