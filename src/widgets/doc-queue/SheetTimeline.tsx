import { StyleSheet, View } from "react-native";
import { Icon, Text } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { stepsOf } from "@/entities/doc-queue";

// New → in progress → sent as a horizontal timeline (done green, current blue, stopped red) and the hint for what comes next.
export function SheetTimeline({ status }: { status: string }) {
  const { t } = useT();
  const c = useColors();
  const steps = stepsOf(status);
  const hintKey = `proDocSheet.hint.${status}`;
  const hint = t(hintKey) === hintKey ? "" : t(hintKey);
  const fill = (x: string) => (x === "done" ? c.ok : x === "now" ? c.accent : x === "fail" ? c.err : "transparent");
  return (
    <View style={s.col}>
      <View style={s.row}>
        {steps.map((st, i) => (
          <View key={st.key} style={s.cell}>
            <View style={s.track}>
              <View style={[s.seg, { backgroundColor: i > 0 && steps[i - 1].state === "done" ? c.ok : i > 0 ? c.line : "transparent" }]} />
              <View style={[s.dot, { backgroundColor: fill(st.state), borderColor: st.state === "todo" ? c.gray2 : fill(st.state) }]}>
                {st.state === "done" ? <Icon name="check" size={13} color="#FFFFFF" /> : st.state === "fail" ? <Icon name="x" size={13} color="#FFFFFF" /> : st.state === "now" ? <View style={s.pulse} /> : null}
              </View>
              <View style={[s.seg, { backgroundColor: i < steps.length - 1 && st.state === "done" ? c.ok : i < steps.length - 1 ? c.line : "transparent" }]} />
            </View>
            <Text variant="caption" weight={st.state === "now" ? "bold" : "regular"} tone={st.state === "now" ? "accent" : st.state === "fail" ? "err" : "gray"} center numberOfLines={1}>{t(`proDocSheet.step.${st.key}`)}</Text>
          </View>
        ))}
      </View>
      {hint ? <Text variant="small">{hint}</Text> : null}
    </View>
  );
}

const s = StyleSheet.create({
  col: { gap: 12 },
  row: { flexDirection: "row" },
  cell: { flex: 1, alignItems: "center", gap: 6 },
  track: { flexDirection: "row", alignItems: "center", alignSelf: "stretch" },
  seg: { flex: 1, height: 3, borderRadius: 2 },
  dot: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  pulse: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#FFFFFF" },
});
