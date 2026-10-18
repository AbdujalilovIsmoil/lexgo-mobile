import { StyleSheet, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { Icon, PressableScale, Text, type IconName } from "@/shared/ui";
import { radius, useColors } from "@/shared/theme";
import { selectHaptic } from "@/shared/lib/haptics";

type Opt<T> = { value: T; label: string };
type Props<T> = { icon: IconName; title: string; options: Opt<T>[]; value: T; onChange: (v: T) => void; open: boolean; onToggle: () => void };

// A long choice list as one field: icon, title and what is picked now; tapping opens its options right underneath
// (all of them, wrapped — no sideways scrolling). Picking closes it.
export function FilterPicker<T extends string | number>({ icon, title, options, value, onChange, open, onToggle }: Props<T>) {
  const c = useColors();
  const cur = options.find((o) => o.value === value);
  const set = options[0]?.value !== value;
  return (
    <View style={[s.box, { backgroundColor: c.surface2, borderColor: open || set ? c.accent : c.line }]}>
      <PressableScale haptic={false} onPress={() => { selectHaptic(); onToggle(); }} accessibilityRole="button" accessibilityState={{ expanded: open }} style={s.head}>
        <View style={[s.ico, { backgroundColor: set ? c.accent : c.surface }]}><Icon name={icon} size={17} color={set ? "#FFFFFF" : c.accent} /></View>
        <View style={s.col}><Text variant="caption" tone="gray">{title}</Text><Text variant="small" weight="bold" numberOfLines={1}>{cur?.label ?? ""}</Text></View>
        <Icon name={open ? "chevron-up" : "chevron-down"} size={18} color={c.gray2} />
      </PressableScale>
      {open ? (
        <Animated.View entering={FadeIn.duration(180)} style={s.opts}>
          {options.map((o) => {
            const on = o.value === value;
            return (
              <PressableScale key={String(o.value)} haptic={false} onPress={() => { selectHaptic(); onChange(o.value); onToggle(); }} accessibilityRole="radio" accessibilityState={{ selected: on }} style={[s.opt, { backgroundColor: on ? c.accent : c.surface, borderColor: on ? c.accent : c.line }]}>
                <Text variant="small" weight={on ? "bold" : "regular"} style={{ color: on ? "#FFFFFF" : c.ink }}>{o.label}</Text>
              </PressableScale>
            );
          })}
        </Animated.View>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  box: { borderRadius: radius.rl, borderWidth: 1.5, overflow: "hidden" },
  head: { flexDirection: "row", alignItems: "center", gap: 12, minHeight: 60, paddingHorizontal: 12 },
  ico: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  col: { flex: 1, gap: 1 },
  opts: { flexDirection: "row", flexWrap: "wrap", gap: 8, paddingHorizontal: 12, paddingBottom: 14 },
  opt: { paddingHorizontal: 14, minHeight: 40, borderRadius: 20, borderWidth: 1, alignItems: "center", justifyContent: "center" },
});
