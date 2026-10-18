import { StyleSheet, View } from "react-native";
import { Icon, Text, type IconName } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";

const STEPS: { key: string; icon: IconName }[] = [
  { key: "ntd.tgS1", icon: "send" },
  { key: "ntd.tgS2", icon: "user-check" },
  { key: "ntd.tgS3", icon: "check-circle" },
];

// How a request goes: sent → confirmed by the admin in Telegram → the plan switches on. Round nodes on a line.
export function RequestSteps() {
  const { t } = useT();
  const c = useColors();
  return (
    <View style={s.row}>
      {STEPS.map((x, i) => (
        <View key={x.key} style={s.col}>
          <View style={s.nodeRow}>
            <View style={[s.line, { backgroundColor: i === 0 ? "transparent" : c.line }]} />
            <View style={[s.node, { backgroundColor: c.tint2 }]}><Icon name={x.icon} size={17} color={c.accent} /></View>
            <View style={[s.line, { backgroundColor: i === STEPS.length - 1 ? "transparent" : c.line }]} />
          </View>
          <Text variant="caption" tone="gray" center numberOfLines={3}>{t(x.key)}</Text>
        </View>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row" },
  col: { flex: 1, alignItems: "center", gap: 6, paddingHorizontal: 2 },
  nodeRow: { flexDirection: "row", alignItems: "center", width: "100%" },
  line: { flex: 1, height: 2 },
  node: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
});
