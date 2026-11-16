import { StyleSheet, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { Icon } from "./Icon";
import { PressableScale } from "./PressableScale";
import { Text } from "./Text";
import { brand, mainColor, useTheme } from "@/shared/theme";
import { selectHaptic } from "@/shared/lib/haptics";

type Opt<T> = { value: T; label: string };

// Adliya .seg3: a grey track, the picked option on a white thumb (ink, bold), the others grey. `fill`: a white track with a hairline and the
// picked option solid blue with white text (the directory's type switch).
// `compact`: a lower switch with smaller type (the directory's, Home's font size).
// Every switch takes the calendar's look now (white track, navy pick, low): the old grey track with a white thumb is gone app-wide.
export function FilterSeg<T extends string | number>({ options, value, onChange }: { options: Opt<T>[]; value: T; onChange: (v: T) => void; fill?: boolean; compact?: boolean }) {
  const fill = true;
  const compact = true;
  const { colors: c, dark, glass } = useTheme();
  const track = fill ? { backgroundColor: dark || glass ? c.surface : "#FFFFFF", borderWidth: 1, borderColor: dark || glass ? c.line : "#E6EBF3" } : { backgroundColor: dark || glass ? c.surface2 : c.line };
  return (
    <View style={[s.seg, track, compact && s.segCompact]} accessibilityRole="radiogroup">
      {options.map((o) => {
        const on = o.value === value;
        return (
          <PressableScale key={String(o.value)} haptic={false} scale={0.97} onPress={() => { selectHaptic(); onChange(o.value); }} accessibilityRole="radio" accessibilityState={{ selected: on }} style={[s.segBtn, compact && s.btnCompact, on && (fill ? { backgroundColor: dark || glass ? brand.b600 : mainColor } /* the bottom bar's active tab colour */ : [s.segOn, { backgroundColor: dark || glass ? c.surface : "#FFFFFF" }])]}>
            <Text variant="small" weight="bold" numberOfLines={1} adjustsFontSizeToFit style={[s.segTx, compact && s.txCompact, { color: on ? (fill ? "#FFFFFF" : c.ink) : c.gray }]}>{o.label}</Text>
          </PressableScale>
        );
      })}
    </View>
  );
}

// Adliya .chip row: wrapped pills, white with a hairline; the picked one navy. `clearable`: tapping the picked one again clears it (to `empty`).
export function FilterChips<T extends string | number>({ options, value, onChange, clearable, empty }: { options: Opt<T>[]; value: T; onChange: (v: T) => void; clearable?: boolean; empty?: T }) {
  const { colors: c, dark, glass } = useTheme();
  return (
    <View style={s.chips}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <PressableScale
            key={String(o.value)}
            haptic={false}
            scale={0.97}
            onPress={() => { selectHaptic(); onChange(on && clearable && empty !== undefined ? empty : o.value); }}
            accessibilityRole="radio"
            accessibilityState={{ selected: on }}
            style={[s.chip, on ? { backgroundColor: dark ? c.accent : c.ink, borderColor: dark ? c.accent : c.ink } : { backgroundColor: dark || glass ? c.surface : "#FFFFFF", borderColor: dark || glass ? c.line : "#E2E8F1" }]}
          >
            <Text variant="small" weight="semibold" numberOfLines={1} style={[s.chipTx, { color: on ? "#FFFFFF" : c.gray }]}>{o.label}</Text>
          </PressableScale>
        );
      })}
    </View>
  );
}

// A select field (white, hairline, the current value and a chevron); a tap opens its options as chips right under it, a pick closes it.
export function FilterSelect<T extends string | number>({ options, value, onChange, open, onToggle, label }: { options: Opt<T>[]; value: T; onChange: (v: T) => void; open: boolean; onToggle: () => void; label: string }) {
  const { colors: c, dark, glass } = useTheme();
  const cur = options.find((o) => o.value === value);
  return (
    <View style={[s.box, { backgroundColor: dark || glass ? c.surface : "#FFFFFF", borderColor: open ? c.accent : dark || glass ? c.line : "#DCE3EE" }]}>
      <PressableScale haptic={false} scale={0.99} onPress={() => { selectHaptic(); onToggle(); }} accessibilityRole="button" accessibilityLabel={`${label}: ${cur?.label ?? ""}`} accessibilityState={{ expanded: open }} style={s.head}>
        <Text variant="body" numberOfLines={1} style={s.value}>{cur?.label ?? ""}</Text>
        <Icon name={open ? "chevron-up" : "chevron-down"} size={18} color={c.ink} />
      </PressableScale>
      {open ? (
        <Animated.View entering={FadeIn.duration(160)} style={s.opts}>
          <FilterChips options={options} value={value} onChange={(v) => { onChange(v); onToggle(); }} />
        </Animated.View>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  seg: { flexDirection: "row", gap: 4, padding: 4, borderRadius: 14 },
  segBtn: { flex: 1, minHeight: 44, borderRadius: 10, alignItems: "center", justifyContent: "center", paddingHorizontal: 4 },
  segOn: { shadowColor: "#000000", shadowOpacity: 0.12, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  segTx: { fontSize: 15 },
  segCompact: { padding: 3, borderRadius: 12, gap: 3 },
  btnCompact: { minHeight: 30, borderRadius: 9 },
  txCompact: { fontSize: 12.5, lineHeight: 16 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { minHeight: 38, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
  chipTx: { fontSize: 14.5 },
  box: { borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  head: { flexDirection: "row", alignItems: "center", gap: 10, minHeight: 52, paddingHorizontal: 16 },
  value: { flex: 1, fontSize: 16 },
  opts: { paddingHorizontal: 12, paddingBottom: 14 },
});
