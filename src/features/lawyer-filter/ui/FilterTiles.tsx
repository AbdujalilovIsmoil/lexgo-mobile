import { StyleSheet, View } from "react-native";
import { Icon, PressableScale, Text, type IconName } from "@/shared/ui";
import { radius, useColors } from "@/shared/theme";
import { selectHaptic } from "@/shared/lib/haptics";

type Opt<T> = { value: T; label: string; icon: IconName; sub?: string };

// A row of equal choice cards (big icon over its name): the picked card is tinted and outlined. Used where there are
// only a few options and each deserves a clear target.
export function FilterTiles<T extends string | number>({ options, value, onChange }: { options: Opt<T>[]; value: T; onChange: (v: T) => void }) {
  const c = useColors();
  return (
    <View style={s.row}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <PressableScale key={String(o.value)} haptic={false} onPress={() => { selectHaptic(); onChange(o.value); }} accessibilityRole="radio" accessibilityState={{ selected: on }} style={[s.tile, { backgroundColor: on ? c.tint2 : c.surface2, borderColor: on ? c.accent : c.line }]}>
            <View style={[s.ico, { backgroundColor: on ? c.accent : c.surface }]}><Icon name={o.icon} size={20} color={on ? "#FFFFFF" : c.accent} /></View>
            <Text variant="small" weight="bold" center numberOfLines={2}>{o.label}</Text>
            {o.sub ? <Text variant="caption" tone="gray" center>{o.sub}</Text> : null}
          </PressableScale>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", gap: 10 },
  tile: { flex: 1, alignItems: "center", gap: 8, paddingVertical: 14, paddingHorizontal: 6, borderRadius: radius.rl, borderWidth: 1.5 },
  ico: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
});
