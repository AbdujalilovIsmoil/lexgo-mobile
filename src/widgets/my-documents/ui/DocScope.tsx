import { ScrollView, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Icon, PressableScale, Skeleton, Text, type IconName } from "@/shared/ui";
import { gradient, useColors } from "@/shared/theme";
import { selectHaptic } from "@/shared/lib/haptics";
import { useT } from "@/shared/i18n";

export type StatKey = "" | "you" | "review" | "ready";
const SCOPES: { key: StatKey; icon: IconName }[] = [
  { key: "", icon: "layers" },
  { key: "you", icon: "edit-3" },
  { key: "review", icon: "briefcase" },
  { key: "ready", icon: "check-circle" },
];

type Props = { counts: Record<string, number>; value: StatKey; onChange: (k: StatKey) => void; loading: boolean };

// The archive split by who holds the ball, as one scrolling row of pills with live counts; the chosen one is filled
// with the brand gradient, and "waiting on you" carries a dot while it is not empty (the thing to do first).
export function DocScope({ counts, value, onChange, loading }: Props) {
  const { t } = useT();
  const c = useColors();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.row}>
      {SCOPES.map(({ key, icon }) => {
        const on = value === key;
        const n = counts[key || "all"] ?? 0;
        const fg = on ? "#FFFFFF" : c.ink;
        const body = (
          <>
            <Icon name={icon} size={16} color={on ? "#FFFFFF" : c.accent} />
            <Text variant="small" weight="semibold" style={{ color: fg }}>{t(`dm1.stat.${key || "all"}`)}</Text>
            {loading ? <Skeleton width={22} height={16} onDark={on} /> : <View style={[s.count, { backgroundColor: on ? "rgba(255,255,255,0.25)" : c.surface2 }]}><Text variant="caption" weight="bold" style={{ color: fg }}>{n}</Text></View>}
            {key === "you" && n > 0 && !on ? <View style={[s.dot, { backgroundColor: c.warn }]} /> : null}
          </>
        );
        return (
          <PressableScale key={key || "all"} haptic={false} onPress={() => { selectHaptic(); onChange(on ? "" : key); }} accessibilityRole="button" accessibilityState={{ selected: on }}>
            {on ? <LinearGradient colors={[...gradient.primary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.pill}>{body}</LinearGradient> : <View style={[s.pill, { backgroundColor: c.surface, borderColor: c.line, borderWidth: 1 }]}>{body}</View>}
          </PressableScale>
        );
      })}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  row: { gap: 8, paddingHorizontal: 16 },
  pill: { flexDirection: "row", alignItems: "center", gap: 8, height: 44, paddingHorizontal: 14, borderRadius: 22 },
  count: { minWidth: 26, height: 22, paddingHorizontal: 7, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  dot: { position: "absolute", top: 6, right: 6, width: 8, height: 8, borderRadius: 4 },
});
