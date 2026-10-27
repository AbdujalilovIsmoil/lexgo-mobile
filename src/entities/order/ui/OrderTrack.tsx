import { StyleSheet, View } from "react-native";
import { useColors } from "@/shared/theme";
import { Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";

const STEPS = ["request", "confirm", "work", "done"] as const;

// Request → payment → work → done; `step` is the current one (phaseStep: 4 = all done). A stopped order (-1) shows nothing: its state is
// the badge.
export function OrderTrack({ step: at, labels }: { step: number; labels?: boolean }) {
  const c = useColors();
  const { t } = useT();
  if (at < 0) return null;
  return (
    <View style={s.row}>
      {STEPS.map((k, i) => {
        const color = i < at ? c.ok : i === at ? c.accent : c.line;
        return (
          <View key={k} style={s.step}>
            <View style={[s.bar, { backgroundColor: color }]} />
            {labels ? <Text variant="caption" weight={i === at ? "bold" : "regular"} tone={i <= at ? "ink" : "gray2"} numberOfLines={1}>{t(`mk4.steps.${k}`)}</Text> : null}
          </View>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", gap: 6 },
  step: { flex: 1, gap: 5 },
  bar: { height: 5, borderRadius: 3 },
});
