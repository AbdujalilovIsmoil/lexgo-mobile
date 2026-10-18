import { StyleSheet, View } from "react-native";
import { Text } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { STEPS, type Step, type StepState } from "@/entities/my-document";

// Fill → pay → advocate review → ready as four slim bars (done green, current blue, stopped red, skipped faint) and one
// line naming where the document is right now. The full timeline lives on the document's own page.
export function DocProgress({ steps }: { steps: Record<Step, StepState> }) {
  const c = useColors();
  const { t } = useT();
  const at = STEPS.find((x) => steps[x] === "now" || steps[x] === "fail") ?? [...STEPS].reverse().find((x) => steps[x] === "done") ?? "fill";
  const state = steps[at];
  const tone = state === "done" ? c.ok : state === "fail" ? c.err : state === "now" ? c.accent : c.gray2;
  const fill = (x: StepState) => (x === "done" ? c.ok : x === "now" ? c.accent : x === "fail" ? c.err : c.line);
  return (
    <View style={s.col}>
      <View style={s.bars}>{STEPS.map((x) => <View key={x} style={[s.bar, { backgroundColor: fill(steps[x]), opacity: steps[x] === "skip" ? 0.45 : 1 }]} />)}</View>
      <Text variant="caption" weight="semibold" numberOfLines={1} style={{ color: tone }}>{`${t(`dm2.step.${at}`)} · ${t(`dm2.stepState.${state}`)}`}</Text>
    </View>
  );
}

const s = StyleSheet.create({ col: { gap: 6 }, bars: { flexDirection: "row", gap: 4 }, bar: { flex: 1, height: 6, borderRadius: 3 } });
