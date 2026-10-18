import { StyleSheet, View } from "react-native";
import { STAGES, type TaskStage } from "@/entities/pro-tasks";
import { useT } from "@/shared/i18n";
import { radius, useColors } from "@/shared/theme";
import { PressableScale, Text } from "@/shared/ui";

// Sticky stage switcher with live counts; stays in step with the paged columns below it.
export function StageTabs({ value, counts, onChange }: { value: TaskStage; counts: Record<TaskStage, number>; onChange: (s: TaskStage) => void }) {
  const c = useColors();
  const { t } = useT();
  return (
    <View accessibilityRole="tablist" accessibilityLabel={t("aw7.stageTabs")} style={[s.bar, { backgroundColor: c.surface2 }]}>
      {STAGES.map((st) => {
        const on = st === value;
        return (
          <PressableScale
            key={st}
            haptic={false}
            scale={0.96}
            accessibilityRole="tab"
            accessibilityLabel={`${t(`aw7.tab.${st}`)}, ${counts[st]}`}
            accessibilityState={{ selected: on }}
            onPress={() => onChange(st)}
            style={[s.tab, on && { backgroundColor: c.surface }]}
          >
            <Text variant="caption" weight={on ? "bold" : "semibold"} tone={on ? "ink" : "gray"} numberOfLines={1} adjustsFontSizeToFit>{t(`aw7.tab.${st}`)}</Text>
            <Text variant="caption" weight="bold" style={{ color: on ? c.accent : c.gray }}>{counts[st]}</Text>
          </PressableScale>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  bar: { flexDirection: "row", marginHorizontal: 16, padding: 4, borderRadius: radius.rl, gap: 2 },
  tab: { flex: 1, minHeight: 48, alignItems: "center", justifyContent: "center", gap: 1, borderRadius: radius.r, paddingHorizontal: 2 },
});
