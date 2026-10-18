import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { radius, useColors } from "@/shared/theme";
import { Icon, PressableScale, Text, type IconName } from "@/shared/ui";

type Props = { title: string; sub?: string; meta?: string; icon?: IconName; on: boolean; onPress: () => void; right?: ReactNode; badge?: ReactNode };

// One option of a radio list (placement · service · package): a whole-row button with a radio mark, 56pt tall.
export function Choice({ title, sub, meta, icon, on, onPress, right, badge }: Props) {
  const c = useColors();
  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ checked: on }}
      accessibilityLabel={[title, sub, meta].filter(Boolean).join(". ")}
      style={[s.row, { borderColor: on ? c.accent : c.line, backgroundColor: on ? c.tint : c.surface }]}
    >
      <Icon name={on ? "check-circle" : "circle"} size={22} color={on ? c.accent : c.gray2} />
      {icon ? <Icon name={icon} size={18} color={on ? c.accent : c.gray} /> : null}
      <View style={s.col}>
        <View style={s.head}>
          <Text variant="body" weight="semibold" numberOfLines={2} style={s.title}>{title}</Text>
          {badge}
        </View>
        {sub ? <Text variant="small" tone="gray" numberOfLines={3}>{sub}</Text> : null}
        {meta ? <Text variant="caption" tone="gray2" numberOfLines={1}>{meta}</Text> : null}
      </View>
      {right}
    </PressableScale>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 10, minHeight: 56, paddingVertical: 10, paddingHorizontal: 12, borderRadius: radius.r, borderWidth: 1.5 },
  col: { flex: 1, gap: 2 },
  head: { flexDirection: "row", alignItems: "center", gap: 8 },
  title: { flexShrink: 1 },
});
