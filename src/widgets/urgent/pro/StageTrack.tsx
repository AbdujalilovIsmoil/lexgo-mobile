import { StyleSheet, View } from "react-native";
import { stepOf, type UrgentRequest } from "@/entities/urgent";
import { useT } from "@/shared/i18n";
import { useColors } from "@/shared/theme";
import { Icon, Text } from "@/shared/ui";

const STEPS = ["stepAssigned", "stepAccepted", "stepProgress", "stepDone"] as const;
const DOT = 26; // every step sits in the same 26-px slot, so the line always runs through the centres

// The four stages of an urgent job: assigned → accepted → in progress → done. One continuous line runs behind the dots (it is as long
// as the span between the first and the last centre) and is filled up to the current step; passed steps are ticked, the current one is
// ringed and named in bold; blue while open, green when done. A cancelled / expired job shows a single red line instead.
export function StageTrack({ req }: { req: UrgentRequest }) {
  const { t } = useT();
  const c = useColors();
  const step = stepOf(req);
  if (step < 0) return <View style={s.fail}><Icon name="x-circle" size={16} color={c.err} /><Text variant="small" weight="semibold" style={{ color: c.err }}>{t("ugx.stepFailed")}</Text></View>;
  const color = step === STEPS.length - 1 ? c.ok : c.accent; // the track says where the job is (blue → green when done); urgency is shown by the edge and the clock
  const last = STEPS.length - 1;
  return (
    <View accessible accessibilityLabel={t("ugx.track", { step: t(`ugx.${STEPS[step]}`) })}>
      <View style={s.dots}>
        <View style={[s.rail, { backgroundColor: c.line }]} />
        <View style={[s.rail, s.fill, { backgroundColor: color, width: `${(step / last) * 75}%` }]} />
        {STEPS.map((k, i) => {
          const done = i < step;
          const cur = i === step;
          return (
            <View key={k} style={s.slot}>
              <View style={[s.dot, { backgroundColor: done || cur ? color : c.surface2, borderColor: done || cur ? color : c.line }, cur && { borderColor: `${color}66`, borderWidth: 5 }]}>
                {done ? <Icon name="check" size={12} color="#FFFFFF" /> : null}
                {cur ? <View style={s.core} /> : null}
              </View>
            </View>
          );
        })}
      </View>
      <View style={s.labels}>
        {STEPS.map((k, i) => <Text key={k} variant="caption" weight={i === step ? "bold" : "regular"} tone={i === step ? "ink" : "gray"} numberOfLines={1} style={s.lab}>{t(`ugx.${k}`)}</Text>)}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  dots: { flexDirection: "row", height: DOT, alignItems: "center" },
  rail: { position: "absolute", left: "12.5%", right: "12.5%", top: DOT / 2 - 1.5, height: 3, borderRadius: 2 },
  fill: { right: undefined },
  slot: { flex: 1, alignItems: "center", justifyContent: "center", height: DOT },
  dot: { width: DOT, height: DOT, borderRadius: DOT / 2, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  core: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#FFFFFF" },
  labels: { flexDirection: "row", marginTop: 6 },
  lab: { flex: 1, fontSize: 11, textAlign: "center" },
  fail: { flexDirection: "row", alignItems: "center", gap: 8 },
});
