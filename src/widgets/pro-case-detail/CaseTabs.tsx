import { ScrollView, StyleSheet, View } from "react-native";
import { useT } from "@/shared/i18n";
import { selectHaptic } from "@/shared/lib/haptics";
import { brand, useColors } from "@/shared/theme";
import { PressableScale, Text } from "@/shared/ui";

export type CaseTab = "docs" | "tasks" | "events" | "history" | "ai";
export const CASE_TABS: CaseTab[] = ["docs", "tasks", "events", "history", "ai"];

// The case's sections as a row of pills; the number of items sits in a small badge (docs, tasks, events).
export function CaseTabs({ value, onChange, counts }: { value: CaseTab; onChange: (t: CaseTab) => void; counts: Partial<Record<CaseTab, number>> }) {
  const { t } = useT();
  const c = useColors();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.scroll} contentContainerStyle={s.row}>
      {CASE_TABS.map((k) => {
        const on = k === value;
        const n = counts[k];
        return (
          <PressableScale key={k} haptic={false} onPress={() => { selectHaptic(); onChange(k); }} accessibilityRole="tab" accessibilityState={{ selected: on }} style={[s.pill, { backgroundColor: on ? brand.b600 : c.surface2, borderColor: on ? brand.b600 : c.line }]}>
            <Text variant="small" weight="bold" style={{ color: on ? "#FFFFFF" : c.ink }}>{t(`aw5.tab.${k}`)}</Text>
            {n ? <View style={[s.badge, { backgroundColor: on ? "rgba(255,255,255,0.28)" : c.tint2 }]}><Text variant="caption" weight="bold" style={{ color: on ? "#FFFFFF" : c.accent }}>{n}</Text></View> : null}
          </PressableScale>
        );
      })}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  scroll: { flexGrow: 0, marginHorizontal: -16 },
  row: { gap: 8, paddingHorizontal: 16 },
  pill: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 999, borderWidth: 1 },
  badge: { minWidth: 20, height: 20, borderRadius: 10, paddingHorizontal: 6, alignItems: "center", justifyContent: "center" },
});
