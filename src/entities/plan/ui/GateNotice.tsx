import { StyleSheet, View } from "react-native";
import { radius, useColors } from "@/shared/theme";
import { Icon, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import type { PlanGate } from "../lib/planGate";
import { gateFacts, useGateText } from "../model/useFeatureLabel";

// Why the plan stopped an action, in the app's words for the backend's code (naming the feature); for a used-up limit also the meter,
// used / limit and when the counter resets — every number as the backend sent it. `titled` adds the code's short title on top (a page;
// a sheet already has it as its own title).
export function GateNotice({ gate, titled }: { gate: PlanGate; titled?: boolean }) {
  const c = useColors();
  const { t, locale } = useT();
  const { title, text } = useGateText(gate);
  const meter = gate.limit !== null && gate.limit > 0 && gate.used !== null;
  const share = meter ? Math.min(1, (gate.used ?? 0) / (gate.limit ?? 1)) : 0;
  const counted = gate.code === "feature_limit_exhausted" || gate.code === "ai_subscription_required";
  const facts = gateFacts(t, gate, locale);
  return (
    <View style={[s.box, { backgroundColor: c.warnBg }]}>
      {titled ? <Text variant="h4">{title}</Text> : null}
      <View style={s.row}>
        <Icon name={counted ? "bar-chart-2" : "lock"} size={18} color={c.warn} />
        <Text variant="small" style={s.flex}>{text}</Text>
      </View>
      {meter ? <View style={[s.track, { backgroundColor: c.surface }]}><View style={[s.bar, { width: `${share * 100}%`, backgroundColor: share >= 1 ? c.err : c.accent }]} /></View> : null}
      {facts ? <Text variant="caption" tone="gray">{facts}</Text> : null}
    </View>
  );
}

const s = StyleSheet.create({
  box: { gap: 8, padding: 12, borderRadius: radius.r },
  row: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  flex: { flex: 1 },
  track: { height: 6, borderRadius: 3, overflow: "hidden" },
  bar: { height: 6, borderRadius: 3 },
});
