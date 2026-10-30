import { StyleSheet, View } from "react-native";
import { inGroup, type GroupFilter } from "@/features/work-filters";
import type { Work } from "@/entities/work";
import { PressableScale, Text } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";

// The top of "Mening ishlarim": three counters — being worked on, waiting for the client (queue: payment, documents, answers…), finished.
// A counter is also the shortcut to that list: a tap filters by it, a second tap takes the filter off.
export function WorksSummary({ works, group, onGroup }: { works: Work[]; group: GroupFilter; onGroup: (g: GroupFilter) => void }) {
  const c = useColors();
  const { t } = useT();
  const cells: { g: GroupFilter; label: string; tint: string }[] = [
    { g: "running", label: t("cl1.list.running"), tint: c.ink },
    { g: "queue", label: t("cl1.list.waiting"), tint: "#A3471A" },
    { g: "done", label: t("cl1.list.finished"), tint: "#1F7A45" },
  ];
  return (
    <View style={s.row}>
      {cells.map((x) => {
        const on = group === x.g;
        return (
          <PressableScale key={x.g} onPress={() => onGroup(on ? "all" : x.g)} scale={0.97} accessibilityRole="button" accessibilityState={{ selected: on }}
            style={[s.cell, { backgroundColor: c.surface, borderColor: on ? x.tint : c.line }, on && s.on]}>
            <Text variant="h2" style={{ color: x.tint }}>{works.filter((w) => inGroup(w, x.g)).length}</Text>
            <Text variant="small" tone="gray" numberOfLines={2}>{x.label}</Text>
          </PressableScale>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", gap: 10, paddingBottom: 14 },
  cell: { flex: 1, gap: 2, paddingHorizontal: 14, paddingVertical: 14, borderRadius: 20, borderWidth: 1, minHeight: 92 },
  on: { borderWidth: 1.5 },
});
