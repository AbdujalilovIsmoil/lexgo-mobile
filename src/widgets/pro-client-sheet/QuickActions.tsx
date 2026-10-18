import { ActivityIndicator, StyleSheet, View } from "react-native";
import { radius, useColors } from "@/shared/theme";
import { Icon, PressableScale, Text, type IconName } from "@/shared/ui";

export type QuickAction = { key: string; icon: IconName; label: string; onPress: () => void; loading?: boolean };

// The few things a lawyer does from a client card, as equal thumb-sized tiles (icon over label) instead of small wrapped buttons.
export function QuickActions({ actions }: { actions: QuickAction[] }) {
  const c = useColors();
  if (!actions.length) return null;
  return (
    <View style={s.row}>
      {actions.map((a) => (
        <PressableScale key={a.key} onPress={a.onPress} disabled={a.loading} accessibilityRole="button" accessibilityLabel={a.label} style={[s.tile, { backgroundColor: c.surface2, borderColor: c.line }]}>
          <View style={[s.icon, { backgroundColor: c.tint2 }]}>
            {a.loading ? <ActivityIndicator size="small" color={c.accentStrong} /> : <Icon name={a.icon} size={20} color={c.accentStrong} />}
          </View>
          <Text variant="caption" weight="semibold" numberOfLines={2} center>{a.label}</Text>
        </PressableScale>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", gap: 10 },
  tile: { flex: 1, minHeight: 84, alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 12, paddingHorizontal: 6, borderRadius: radius.r, borderWidth: 1 },
  icon: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
});
