import { StyleSheet, View } from "react-native";
import { ladderOf, type Step } from "@/entities/pro-referrals";
import { useT } from "@/shared/i18n";
import { radius, useColors } from "@/shared/theme";
import { Card, Icon, Pill, Text } from "@/shared/ui";
import { ProgressBar } from "@/shared/ui/charts";

const NODE = 32;

// Commission ladder as a vertical milestone track: unlocked / current / next / locked, with a bar to the next level.
export function LadderTrack({ active }: { active: number }) {
  const { t } = useT();
  const c = useColors();
  const l = ladderOf(active);
  const stateLabel = (x: Step) => t(x.state === "done" ? "refUx.lvlDone" : x.state === "current" ? "refUx.lvlNow" : x.state === "next" ? "refUx.lvlNext" : "refUx.lvlLocked");
  return (
    <Card style={s.card}>
      <View style={s.head}>
        <Text variant="h4">{t("refUx.ladderTitle")}</Text>
        <Pill label={t("refUx.now", { pct: l.pct })} tone="ok" />
      </View>
      <View style={s.progress}>
        <ProgressBar value={l.next ? l.progress : 1} />
        <Text variant="small" tone="gray">{l.next ? t("refUx.leftTo", { n: l.left, pct: l.next.pct }) : t("refUx.top")}</Text>
      </View>
      <View>
        {l.steps.map((x, i) => {
          const last = i === l.steps.length - 1;
          const lit = x.state === "done" || x.state === "current";
          const fill = x.state === "done" ? 1 : x.state === "current" ? l.progress : 0;
          return (
            <View key={x.need} style={s.row} accessible accessibilityLabel={t("refUx.lvlA11y", { pct: x.pct, n: x.need, state: stateLabel(x) })}>
              <View style={s.rail}>
                <View style={[s.node, lit ? { backgroundColor: c.accent, borderColor: c.accent } : { backgroundColor: c.surface, borderColor: x.state === "next" ? c.accent : c.line }]}>
                  {x.state === "done" ? <Icon name="check" size={16} tone="white" /> : x.state === "current" ? <View style={s.dot} /> : x.state === "locked" ? <Icon name="lock" size={13} tone="gray" /> : null}
                </View>
                {last ? null : (
                  <View style={[s.line, { backgroundColor: c.surface2 }]}>
                    <View style={{ height: `${fill * 100}%`, backgroundColor: c.accent }} />
                  </View>
                )}
              </View>
              <View style={[s.info, last && s.lastInfo]}>
                <View style={s.infoTop}>
                  <Text variant="h3" tone={x.state === "locked" ? "gray2" : "ink"}>{`${x.pct}%`}</Text>
                  {x.state === "current" ? <Pill small label={stateLabel(x)} tone="blue" /> : x.state === "next" ? <Pill small label={t("refUx.left", { n: l.left })} tone="cy" /> : null}
                </View>
                <Text variant="caption" tone="gray">{x.need === 0 ? t("refUx.base") : t("refUx.needN", { n: x.need })}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </Card>
  );
}

const s = StyleSheet.create({
  card: { gap: 14 },
  head: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  progress: { gap: 8 },
  row: { flexDirection: "row", gap: 14 },
  rail: { alignItems: "center", width: NODE },
  node: { width: NODE, height: NODE, borderRadius: NODE / 2, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#FFFFFF" },
  line: { flex: 1, width: 4, borderRadius: radius.pill, overflow: "hidden", marginVertical: 2 },
  info: { flex: 1, minHeight: 64, gap: 2, paddingTop: 2 },
  lastInfo: { minHeight: NODE },
  infoTop: { flexDirection: "row", alignItems: "center", gap: 8 },
});
