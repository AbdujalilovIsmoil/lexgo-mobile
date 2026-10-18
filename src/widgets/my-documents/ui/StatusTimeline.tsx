import { StyleSheet, View } from "react-native";
import { Icon, Text } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { STEPS, type Step, type StepState } from "@/entities/my-document";

const ICON = { done: "check", fail: "x", skip: "minus", now: "circle", todo: "circle" } as const;

// Fill → pay → advocate review → ready, with where this document is now (skipped steps are dashed).
export function StatusTimeline({ steps, paid }: { steps: Record<Step, StepState>; paid: boolean }) {
  const c = useColors();
  const { t } = useT();
  return (
    <View style={s.row}>
      {STEPS.map((st, i) => {
        const state = steps[st];
        const fill = state === "done" ? c.ok : state === "now" ? c.accent : state === "fail" ? c.err : "transparent";
        const ring = state === "todo" || state === "skip" ? c.gray2 : fill;
        const seg = (left: boolean) => (left ? steps[STEPS[i - 1]] : state) === "done" ? c.ok : c.line;
        return (
          <View key={st} style={s.cell}>
            <View style={s.track}>
              <View style={[s.seg, { backgroundColor: i > 0 ? seg(true) : "transparent" }]} />
              <View style={[s.dot, { backgroundColor: fill, borderColor: ring, borderStyle: state === "skip" ? "dashed" : "solid" }]}>
                {state === "todo" ? null : <Icon name={ICON[state]} size={state === "now" ? 8 : 14} color="#FFFFFF" />}
              </View>
              <View style={[s.seg, { backgroundColor: i < STEPS.length - 1 ? seg(false) : "transparent" }]} />
            </View>
            <Text variant="caption" weight="bold" center numberOfLines={1}>{t(`dm2.step.${st}`)}</Text>
            <Text variant="caption" tone={state === "now" ? "accent" : state === "fail" ? "err" : "gray2"} center numberOfLines={2}>{t(`dm2.stepState.${st === "pay" && state === "done" && paid ? "paid" : state}`)}</Text>
          </View>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row" },
  cell: { flex: 1, alignItems: "center", gap: 2 },
  track: { flexDirection: "row", alignItems: "center", alignSelf: "stretch", marginBottom: 6 },
  seg: { flex: 1, height: 3, borderRadius: 2 },
  dot: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, alignItems: "center", justifyContent: "center" },
});
