import { StyleSheet, View } from "react-native";
import { useT } from "@/shared/i18n";
import { selectHaptic } from "@/shared/lib/haptics";
import { useColors } from "@/shared/theme";
import { PressableScale, Text } from "@/shared/ui";

type Props = { value: string; onChange: (v: string) => void };

// Low / medium / high as three coloured segments (green · amber · red) — the chosen one is tinted and outlined.
export function PrioritySegment({ value, onChange }: Props) {
  const { t } = useT();
  const c = useColors();
  const items = [
    { v: "low", color: c.ok, bg: c.okBg },
    { v: "medium", color: c.warn, bg: c.warnBg },
    { v: "high", color: c.err, bg: c.errBg },
  ];
  return (
    <View style={s.row} accessibilityRole="radiogroup">
      {items.map((x) => {
        const on = x.v === value;
        return (
          <PressableScale key={x.v} haptic={false} onPress={() => { if (!on) selectHaptic(); onChange(x.v); }} accessibilityRole="radio" accessibilityState={{ selected: on }} style={[s.seg, { backgroundColor: on ? x.bg : c.surface, borderColor: on ? x.color : c.line }]}>
            <View style={[s.dot, { backgroundColor: x.color }]} />
            <Text variant="small" weight="semibold" tone={on ? "ink" : "gray"}>{t(`aw11.priority.${x.v}`)}</Text>
          </PressableScale>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", gap: 8 },
  seg: { flex: 1, minHeight: 46, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, borderRadius: 14, borderWidth: 1.5 },
  dot: { width: 9, height: 9, borderRadius: 5 },
});
