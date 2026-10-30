import { StyleSheet, View } from "react-native";
import { inGroup, type GroupFilter } from "@/features/work-filters";
import type { Work } from "@/entities/work";
import { Icon, PressableScale, Text, type IconName } from "@/shared/ui";
import { useTheme } from "@/shared/theme";
import { useT } from "@/shared/i18n";

// The top of "Mening ishlarim": three counters — being worked on, waiting for the client (queue: payment, documents, answers…), finished —
// each an icon disc in its colour, the number beside it and a short label under. A counter is also the shortcut to that list: a tap
// filters by it (the tile fills with its colour), a second tap takes the filter off.
export function WorksSummary({ works, group, onGroup }: { works: Work[]; group: GroupFilter; onGroup: (g: GroupFilter) => void }) {
  const { colors: c, dark } = useTheme();
  const { t } = useT();
  const cells: { g: GroupFilter; label: string; icon: IconName; tint: string }[] = [
    { g: "running", label: t("cl1.list.running"), icon: "activity", tint: "#1668F0" },
    { g: "queue", label: t("cl1.list.waiting"), icon: "clock", tint: "#E0791C" },
    { g: "done", label: t("cl1.list.finished"), icon: "check-circle", tint: "#1F9D55" },
  ];
  return (
    <View style={s.row}>
      {cells.map((x) => {
        const on = group === x.g;
        return (
          <PressableScale key={x.g} onPress={() => onGroup(on ? "all" : x.g)} scale={0.97} accessibilityRole="button" accessibilityState={{ selected: on }}
            style={[s.cell, { backgroundColor: on ? x.tint : c.surface, borderColor: on ? x.tint : c.line }]}>
            <View style={s.top}>
              <View style={[s.ico, { backgroundColor: on ? "rgba(255,255,255,0.22)" : `${x.tint}${dark ? "33" : "1A"}` }]}>
                <Icon name={x.icon} size={15} color={on ? "#FFFFFF" : x.tint} />
              </View>
              <Text variant="h3" style={[s.n, { color: on ? "#FFFFFF" : c.ink }]}>{works.filter((w) => inGroup(w, x.g)).length}</Text>
            </View>
            <Text variant="caption" weight="semibold" numberOfLines={1} style={{ color: on ? "rgba(255,255,255,0.9)" : c.gray }}>{x.label}</Text>
          </PressableScale>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", gap: 8, paddingBottom: 14 },
  cell: { flex: 1, gap: 8, padding: 12, borderRadius: 18, borderWidth: 1 },
  top: { flexDirection: "row", alignItems: "center", gap: 8 },
  ico: { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  n: { fontSize: 20, lineHeight: 24 },
});
