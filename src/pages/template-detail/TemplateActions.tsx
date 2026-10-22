import { StyleSheet, View } from "react-native";
import { radius, useColors } from "@/shared/theme";
import { Icon, PressableScale, Text, type IconName } from "@/shared/ui";

type Action = { key: string; icon: IconName; title: string; hint: string; primary?: boolean; busy?: boolean; onPress: () => void };

// The three things one can do with a template, one under another (never in a single row on a phone): a big tappable row each, the
// first one filled with the brand colour.
export function TemplateActions({ actions }: { actions: Action[] }) {
  const c = useColors();
  return (
    <View style={s.col}>
      {actions.map((a) => (
        <PressableScale key={a.key} onPress={a.onPress} disabled={a.busy} accessibilityRole="button" accessibilityLabel={`${a.title}. ${a.hint}`} accessibilityState={{ busy: !!a.busy }}
          style={[s.row, a.primary ? { backgroundColor: c.accent, borderColor: c.accent } : { backgroundColor: c.glassFill, borderColor: c.glassLine }]}>
          <View style={[s.tile, { backgroundColor: a.primary ? "rgba(255,255,255,0.2)" : c.tint2 }]}><Icon name={a.busy ? "loader" : a.icon} size={22} color={a.primary ? "#FFFFFF" : c.accent} /></View>
          <View style={s.txt}>
            <Text variant="body" weight="bold" style={a.primary ? { color: "#FFFFFF" } : undefined}>{a.title}</Text>
            <Text variant="caption" style={{ color: a.primary ? "rgba(255,255,255,0.85)" : c.gray }}>{a.hint}</Text>
          </View>
          <Icon name="chevron-right" size={20} color={a.primary ? "#FFFFFF" : c.gray} />
        </PressableScale>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  col: { gap: 10 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: radius.rl, borderWidth: 1, minHeight: 72 },
  tile: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  txt: { flex: 1, gap: 2 },
});
