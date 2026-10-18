import { StyleSheet, View } from "react-native";
import { useColors } from "@/shared/theme";
import { Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { PHASE_STEP, type PurchasePhase } from "../model/phase";

const STEPS = ["request", "confirm", "chat"] as const;

// Request → payment approval → chat as three slim bars (done green, current blue, cancelled red) with their names under.
export function PurchaseSteps({ phase }: { phase: PurchasePhase | null }) {
  const c = useColors();
  const { t } = useT();
  const at = phase ? PHASE_STEP[phase] : 0;
  const failed = phase === "cancelled";
  return (
    <View style={s.row}>
      {STEPS.map((k, i) => {
        const bg = failed && i === at ? c.err : i < at ? c.ok : i === at ? c.accent : c.line;
        return (
          <View key={k} style={s.step}>
            <View style={[s.bar, { backgroundColor: bg }]} />
            <Text variant="caption" weight={i === at ? "bold" : "regular"} tone={i <= at ? "ink" : "gray2"} numberOfLines={1}>{`${i + 1} · ${t(`mk3.steps.${k}`)}`}</Text>
          </View>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", gap: 8 },
  step: { flex: 1, gap: 6 },
  bar: { height: 5, borderRadius: 3 },
});
