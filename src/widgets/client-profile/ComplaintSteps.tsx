import { StyleSheet, View } from "react-native";
import { Icon, Text, type IconName } from "@/shared/ui";
import { useT } from "@/shared/i18n";

const STEPS: { key: "write" | "review" | "decision"; icon: IconName }[] = [
  { key: "write", icon: "send" },
  { key: "review", icon: "headphones" },
  { key: "decision", icon: "check-circle" },
];

// The three-step flow as a stepper: round icon nodes joined by a line, "N-qadam" and the step under each.
export function ComplaintSteps() {
  const { t } = useT();
  return (
    <View style={s.row}>
      {STEPS.map((x, i) => (
        <View key={x.key} style={s.col}>
          <View style={s.nodeRow}>
            <View style={[s.line, i === 0 && s.hide]} />
            <View style={s.node}><Icon name={x.icon} size={20} tone="white" /></View>
            <View style={[s.line, i === STEPS.length - 1 && s.hide]} />
          </View>
          <Text variant="caption" style={s.n}>{t("pwc.stepN", { n: i + 1 })}</Text>
          <Text variant="small" weight="bold" tone="white" center numberOfLines={3}>{t(`pwc.steps.${x.key}`)}</Text>
        </View>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row" },
  col: { flex: 1, alignItems: "center", gap: 2 },
  nodeRow: { flexDirection: "row", alignItems: "center", width: "100%", marginBottom: 6 },
  line: { flex: 1, height: 2, backgroundColor: "rgba(255,255,255,0.3)" },
  hide: { backgroundColor: "transparent" },
  node: { width: 46, height: 46, borderRadius: 23, backgroundColor: "rgba(255,255,255,0.18)", borderWidth: 1.5, borderColor: "rgba(255,255,255,0.45)", alignItems: "center", justifyContent: "center" },
  n: { color: "#9FD4FF" },
});
