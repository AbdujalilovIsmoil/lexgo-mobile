import { StyleSheet, View } from "react-native";
import { PressableScale, Text } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { selectHaptic } from "@/shared/lib/haptics";

type Opt = { value: number; label: string };

// An ordered scale (experience, price ceiling) as one track with a stop per option: everything up to the picked stop is
// filled, so "more" reads as "further along". The first stop is "any".
export function FilterSteps({ options, value, onChange }: { options: Opt[]; value: number; onChange: (v: number) => void }) {
  const c = useColors();
  const at = Math.max(0, options.findIndex((o) => o.value === value));
  return (
    <View style={s.box}>
      <View style={s.track}>
        {options.map((o, i) => (
          <View key={o.value} style={s.seg}>
            <View style={[s.line, { backgroundColor: i === 0 ? "transparent" : i <= at ? c.accent : c.line }]} />
            <View style={[s.dot, { backgroundColor: i <= at ? c.accent : c.surface, borderColor: i <= at ? c.accent : c.gray2 }]} />
            <View style={[s.line, { backgroundColor: i === options.length - 1 ? "transparent" : i < at ? c.accent : c.line }]} />
          </View>
        ))}
      </View>
      <View style={s.labels}>
        {options.map((o, i) => (
          <PressableScale key={o.value} haptic={false} onPress={() => { selectHaptic(); onChange(o.value); }} accessibilityRole="radio" accessibilityState={{ selected: i === at }} style={s.hit}>
            <Text variant="caption" weight={i === at ? "bold" : "regular"} tone={i === at ? "accent" : "gray"} center numberOfLines={2}>{o.label}</Text>
          </PressableScale>
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  box: { gap: 4 },
  track: { flexDirection: "row", alignItems: "center", marginBottom: -26 },
  seg: { flex: 1, flexDirection: "row", alignItems: "center", height: 30 },
  line: { flex: 1, height: 4, borderRadius: 2 },
  dot: { width: 18, height: 18, borderRadius: 9, borderWidth: 2 },
  labels: { flexDirection: "row", paddingTop: 30 },
  hit: { flex: 1, minHeight: 44, alignItems: "center", justifyContent: "flex-start", paddingTop: 2 },
});
