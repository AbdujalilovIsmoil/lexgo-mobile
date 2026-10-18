import { useState } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { groupTasks, TASK_TABS, type CabinetCase, type TaskTab } from "@/entities/pro-workspace";
import { fmtDate } from "@/shared/lib/format";
import { todayKey } from "@/shared/lib/pro/dates";
import { radius, useColors } from "@/shared/theme";
import { Icon, Pill, Segmented, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { Panel } from "./Panel";

// "Mening vazifalarim": the active cases as task cards — a coloured edge (blue ahead, green done), what is next (or the case
// title), the case number, the deadline and the stage. A segmented control with live counts switches today / upcoming / done.
export function TasksPanel({ cases, i }: { cases: CabinetCase[]; i: number }) {
  const { t, locale } = useT();
  const c = useColors();
  const [tab, setTab] = useState<TaskTab>("today");
  const groups = groupTasks(cases, todayKey());
  const rows = groups[tab];
  return (
    <Panel i={i} icon="check-square" title={t("shm.dash.myTasks")}>
      <Segmented value={tab} onChange={setTab} options={TASK_TABS.map((k) => ({ value: k, label: t(`shm.dash.tab_${k}`, { n: groups[k].length }) }))} />
      {rows.length ? (
        <View style={s.list}>
          {rows.map((x, n) => (
            <Animated.View key={`${tab}-${x.id}`} entering={FadeInDown.delay(Math.min(n, 5) * 50).duration(240)} style={[s.card, { backgroundColor: c.surface2 }]}>
              <View style={[s.edge, { backgroundColor: tab === "done" ? c.ok : tab === "today" ? c.warn : c.accent }]} />
              <View style={s.mid}>
                <Text variant="small" weight="bold" numberOfLines={2}>{x.nextAction || x.title}</Text>
                {x.number ? <Text variant="caption" tone="gray">{x.number}</Text> : null}
                <View style={s.meta}>
                  {x.deadlineAt ? <View style={s.when}><Icon name="clock" size={12} tone="gray" /><Text variant="caption" tone="gray">{fmtDate(x.deadlineAt, locale)}</Text></View> : null}
                  {x.stage ? <Pill label={x.stage} tone={tab === "done" ? "ok" : "blue"} small /> : null}
                </View>
              </View>
            </Animated.View>
          ))}
        </View>
      ) : (
        <View style={s.empty}><View style={[s.eIco, { backgroundColor: c.tint2 }]}><Icon name="check" size={20} color={c.accent} /></View><Text variant="small" tone="gray" center>{t("shm.dash.tasksEmpty")}</Text></View>
      )}
    </Panel>
  );
}

const s = StyleSheet.create({
  list: { gap: 8 },
  card: { flexDirection: "row", gap: 12, padding: 12, borderRadius: radius.r },
  edge: { width: 4, borderRadius: 2 },
  mid: { flex: 1, gap: 3 },
  meta: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8, marginTop: 2 },
  when: { flexDirection: "row", alignItems: "center", gap: 4 },
  empty: { alignItems: "center", gap: 8, paddingVertical: 10 },
  eIco: { width: 44, height: 44, borderRadius: 15, alignItems: "center", justifyContent: "center" },
});
