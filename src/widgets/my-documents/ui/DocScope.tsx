import { StyleSheet, View } from "react-native";
import { Icon, PressableScale, Skeleton, Text, type IconName } from "@/shared/ui";
import { useTheme } from "@/shared/theme";
import { selectHaptic } from "@/shared/lib/haptics";
import { useT } from "@/shared/i18n";

export type StatKey = "" | "you" | "review" | "ready";
const SCOPES: { key: Exclude<StatKey, "">; icon: IconName; tint: string }[] = [
  { key: "you", icon: "edit-3", tint: "#E0791C" },
  { key: "review", icon: "briefcase", tint: "#1668F0" },
  { key: "ready", icon: "check-circle", tint: "#1F9D55" },
];

type Props = { counts: Record<string, number>; value: StatKey; onChange: (k: StatKey) => void; loading: boolean };

// The archive split by who holds the ball, as three counters (the same look as "Mening ishlarim"): an icon disc in each one's colour, the
// live count beside it, a short label under. A tap filters by it (the tile fills with its colour), a second tap takes the filter off.
export function DocScope({ counts, value, onChange, loading }: Props) {
  const { t } = useT();
  const { colors: c, dark } = useTheme();
  return (
    <View style={s.row}>
      {SCOPES.map(({ key, icon, tint }) => {
        const on = value === key;
        return (
          <PressableScale key={key} haptic={false} scale={0.97} onPress={() => { selectHaptic(); onChange(on ? "" : key); }} accessibilityRole="button" accessibilityState={{ selected: on }}
            style={[s.cell, { backgroundColor: on ? tint : c.surface, borderColor: on ? tint : c.line }]}>
            <View style={s.top}>
              <View style={[s.ico, { backgroundColor: on ? "rgba(255,255,255,0.22)" : `${tint}${dark ? "33" : "1A"}` }]}><Icon name={icon} size={15} color={on ? "#FFFFFF" : tint} /></View>
              {loading ? <Skeleton width={26} height={20} onDark={on} /> : <Text variant="h3" style={[s.n, { color: on ? "#FFFFFF" : c.ink }]}>{counts[key] ?? 0}</Text>}
            </View>
            <Text variant="caption" weight="semibold" numberOfLines={1} style={{ color: on ? "rgba(255,255,255,0.9)" : c.gray }}>{t(`dm1.statShort.${key}`)}</Text>
          </PressableScale>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", gap: 8, paddingHorizontal: 16 },
  cell: { flex: 1, gap: 8, padding: 12, borderRadius: 18, borderWidth: 1 },
  top: { flexDirection: "row", alignItems: "center", gap: 8 },
  ico: { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  n: { fontSize: 20, lineHeight: 24 },
});
