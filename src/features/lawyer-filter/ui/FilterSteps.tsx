import { StyleSheet, View } from "react-native";
import { PressableScale, Text } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { selectHaptic } from "@/shared/lib/haptics";

type Opt = { value: number; label: string };

// An ordered scale (experience, price ceiling) as one track with a stop per option: everything up to the picked stop is
// filled, so "more" reads as "further along". The first stop is "any". Each stop — its piece of the track, the dot and the
// label — is one tap target, so a tap on the dot picks it as surely as a tap on the words.
export function FilterSteps({ options, value, onChange }: { options: Opt[]; value: number; onChange: (v: number) => void }) {
  const c = useColors();
  const at = Math.max(0, options.findIndex((o) => o.value === value));
  return (
    <View style={s.row}>
      {options.map((o, i) => (
        <PressableScale key={o.value} haptic={false} scale={0.96} onPress={() => { selectHaptic(); onChange(o.value); }} accessibilityRole="radio" accessibilityLabel={o.label} accessibilityState={{ selected: i === at }} style={s.stop}>
          <View style={s.track}>
            <View style={[s.line, { backgroundColor: i === 0 ? "transparent" : i <= at ? c.accent : c.line }]} />
            <View style={[s.dot, { backgroundColor: i <= at ? c.accent : c.surface, borderColor: i <= at ? c.accent : c.gray2 }, i === at && s.picked]} />
            <View style={[s.line, { backgroundColor: i === options.length - 1 ? "transparent" : i < at ? c.accent : c.line }]} />
          </View>
          <Text variant="caption" weight={i === at ? "bold" : "regular"} tone={i === at ? "accent" : "gray"} center numberOfLines={2}>{o.label}</Text>
        </PressableScale>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row" },
  stop: { flex: 1, alignItems: "stretch", gap: 6, paddingBottom: 4, minHeight: 64 },
  track: { flexDirection: "row", alignItems: "center", height: 30 },
  line: { flex: 1, height: 4, borderRadius: 2 },
  dot: { width: 18, height: 18, borderRadius: 9, borderWidth: 2 },
  picked: { width: 22, height: 22, borderRadius: 11 },
});
