import { StyleSheet, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useT } from "@/shared/i18n";
import { fmtDate, initials } from "@/shared/lib/format";
import { tOr } from "@/shared/lib/pro/tOr";
import { radius, useColors } from "@/shared/theme";
import { Icon, Pill, PressableScale, Text } from "@/shared/ui";
import { dueOf } from "../lib/deadline";
import { caseTint, isClosedCase } from "../lib/status";
import type { ProCase } from "../model/types";

// One case as a card: a coloured edge for its status, the client (or the case title) as the headline with a monogram, the case
// type and number, the stage and status pills, the next step in a tinted box and the deadline chip (red when late, amber today).
export function CaseRow({ item, client, onPress, index = 0 }: { item: ProCase; client?: string; onPress: () => void; index?: number }) {
  const { t, locale } = useT();
  const c = useColors();
  const tint = caseTint(item.status);
  const due = dueOf(item.deadlineAt, isClosedCase(item.status));
  const dueTone = due === "overdue" ? c.err : due === "today" ? c.warn : due === "soon" ? c.accent : c.gray;
  const head = client || item.title || item.number;
  return (
    <Animated.View entering={FadeInDown.delay(Math.min(index, 8) * 40).duration(260)}>
      <PressableScale onPress={onPress} scale={0.985} accessibilityRole="button" accessibilityLabel={`${head}. ${item.title}`} style={[s.card, { backgroundColor: c.glassFill, borderColor: c.glassLine }]}>
        <View style={[s.edge, { backgroundColor: tint }]} />
        <View style={s.body}>
          <View style={s.top}>
            <View style={[s.mono, { backgroundColor: `${tint}22` }]}><Text variant="small" weight="bold" style={{ color: tint }}>{initials(head) || "?"}</Text></View>
            <View style={s.who}>
              <Text variant="body" weight="bold" numberOfLines={1}>{head}</Text>
              <Text variant="caption" tone="gray" numberOfLines={1}>{[client ? item.title : "", item.number].filter(Boolean).join(" · ")}</Text>
            </View>
            <Pill label={tOr(t, `aw11.caseStatus.${item.status}`, item.status)} tone={isClosedCase(item.status) ? "gray" : item.status === "court" ? "err" : item.status === "new" ? "blue" : "ok"} small />
          </View>
          {item.nextAction ? (
            <View style={[s.next, { backgroundColor: c.surface2 }]}>
              <Icon name="arrow-right-circle" size={15} color={c.accent} />
              <View style={s.nextTx}><Text variant="caption" tone="gray2">{t("mcs.next")}</Text><Text variant="small" weight="semibold" numberOfLines={2}>{item.nextAction}</Text></View>
            </View>
          ) : null}
          <View style={s.foot}>
            {item.stage ? <View style={[s.chip, { backgroundColor: c.tint2 }]}><Icon name="layers" size={12} color={c.accent} /><Text variant="caption" weight="bold" tone="accent">{tOr(t, `aw11.stage.${item.stage}`, item.stage)}</Text></View> : null}
            {item.deadlineAt ? (
              <View style={[s.chip, { backgroundColor: `${dueTone}1F` }]}>
                <Icon name="clock" size={12} color={dueTone} />
                <Text variant="caption" weight="bold" style={{ color: dueTone }}>{due === "overdue" ? `${t("mcs.overdue")} · ` : due === "today" ? `${t("mcs.today")} · ` : ""}{fmtDate(item.deadlineAt, locale)}</Text>
              </View>
            ) : null}
          </View>
        </View>
      </PressableScale>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  card: { flexDirection: "row", borderRadius: radius.rl, borderWidth: 1, overflow: "hidden" },
  edge: { width: 5 },
  body: { flex: 1, gap: 10, padding: 14 },
  top: { flexDirection: "row", alignItems: "center", gap: 10 },
  mono: { width: 40, height: 40, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  who: { flex: 1, gap: 1 },
  next: { flexDirection: "row", gap: 8, padding: 10, borderRadius: 12 },
  nextTx: { flex: 1, gap: 1 },
  foot: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 9, paddingVertical: 5, borderRadius: 10 },
});
