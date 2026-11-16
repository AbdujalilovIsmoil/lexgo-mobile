import { StyleSheet, View } from "react-native";
import { useColors } from "@/shared/theme";
import { Icon, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";

const STEPS = ["request", "confirm", "work", "done"] as const;

// Request → payment → work → done; `step` is the current one (phaseStep: 4 = all done). A stopped order (-1) shows nothing: its state is
// the badge.
export function OrderTrack({ step: at, labels }: { step: number; labels?: boolean }) {
  const c = useColors();
  const { t } = useT();
  if (at < 0) return null;
  if (labels) return <Stepper at={at} />;
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

// The order page's track (Adliya): a circle per step joined by a line — done steps blue with a check, the current one a thick blue ring, the
// rest grey — and the step's name under it.
function Stepper({ at }: { at: number }) {
  const c = useColors();
  const { t } = useT();
  return (
    <View style={s.stepper}>
      {STEPS.map((k, i) => {
        const done = i < at;
        const now = i === at;
        return (
          <View key={k} style={s.stop}>
            <View style={s.track}>
              <View style={[s.link, { backgroundColor: i === 0 ? "transparent" : i <= at ? c.accent : c.line }]} />
              <View style={[s.dot, { borderColor: done || now ? c.accent : c.line, borderWidth: now ? 3.5 : 2, backgroundColor: c.surface }]}>
                {done ? <Icon name="check" size={12} color={c.accent} /> : null}
              </View>
              <View style={[s.link, { backgroundColor: i === STEPS.length - 1 ? "transparent" : i < at ? c.accent : c.line }]} />
            </View>
            <Text variant="caption" weight={done || now ? "bold" : "regular"} numberOfLines={1} style={{ color: done || now ? c.accent : c.gray, fontSize: 12.5 }}>{t(`mk4.steps.${k}`)}</Text>
          </View>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  stepper: { flexDirection: "row", marginTop: 4 },
  stop: { flex: 1, alignItems: "center", gap: 6 },
  track: { flexDirection: "row", alignItems: "center", alignSelf: "stretch" },
  link: { flex: 1, height: 2.5, borderRadius: 2 },
  dot: { width: 26, height: 26, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  row: { flexDirection: "row", gap: 6 },
  step: { flex: 1, gap: 5 },
  bar: { height: 5, borderRadius: 3 },
});
