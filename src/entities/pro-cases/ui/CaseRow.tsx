import { Platform, StyleSheet, View } from "react-native";
import { useT } from "@/shared/i18n";
import { fmtDate } from "@/shared/lib/format";
import { tOr } from "@/shared/lib/pro/tOr";
import { useTheme } from "@/shared/theme";
import { PressableScale, Text } from "@/shared/ui";
import { dueOf } from "../lib/deadline";
import { CASE_STATUSES, isClosedCase } from "../lib/status";
import type { ProCase } from "../model/types";

// How far along the case is, from its status (new … completed); archived counts as done.
const progressOf = (status: string): number => {
  if (status === "archived") return 1;
  const i = (CASE_STATUSES as readonly string[]).indexOf(status);
  return i < 0 ? 0.1 : Math.max(0.1, (i + 1) / (CASE_STATUSES.length - 1));
};

// One case as a white card (Adliya): the number in monospace grey with the status pill on the right, the title, one grey line (the client ·
// the next step or the deadline — red when late), and a progress bar for how far the case has come.
export function CaseRow({ item, client, onPress }: { item: ProCase; client?: string; onPress: () => void; index?: number }) {
  const { t, locale } = useT();
  const { colors: c, dark, glass } = useTheme();
  const closed = isClosedCase(item.status);
  const due = dueOf(item.deadlineAt, closed);
  const when = item.deadlineAt ? `${due === "overdue" ? `${t("mcs.overdue")} · ` : due === "today" ? `${t("mcs.today")} · ` : ""}${fmtDate(item.deadlineAt, locale)}` : "";
  const sub = [client, item.nextAction || when].filter(Boolean).join(" · ");
  const status = tOr(t, `aw11.caseStatus.${item.status}`, item.status);
  const tone = closed ? { bg: c.tint2, fg: c.accentStrong } : item.status === "new" ? { bg: c.warnBg, fg: c.warn } : item.status === "court" ? { bg: c.errBg, fg: c.err } : { bg: c.okBg, fg: c.ok };
  const title = item.title || item.number;
  return (
    <PressableScale onPress={onPress} scale={0.985} accessibilityRole="button" accessibilityLabel={`${title}. ${status}`} style={[s.card, { backgroundColor: dark || glass ? c.surface : "#FFFFFF", borderColor: dark || glass ? c.line : "#E6EBF3" }, !glass && s.shadow]}>
      <View style={s.top}>
        <Text variant="small" tone="gray" numberOfLines={1} style={s.num}>{item.number || "—"}</Text>
        <View style={[s.pill, { backgroundColor: tone.bg }]}><Text variant="caption" weight="bold" numberOfLines={1} style={{ color: tone.fg }}>{status}</Text></View>
      </View>
      <Text variant="body" weight="bold" numberOfLines={2} style={s.title}>{title}</Text>
      {sub ? <Text variant="small" numberOfLines={1} style={{ color: due === "overdue" && !item.nextAction ? c.err : c.gray }}>{sub}</Text> : null}
      <View style={[s.track, { backgroundColor: dark || glass ? c.surface2 : "#E6EBF3" }]}>
        <View style={[s.fill, { width: `${Math.round(progressOf(item.status) * 100)}%`, backgroundColor: c.accent }]} />
      </View>
    </PressableScale>
  );
}

const s = StyleSheet.create({
  card: { padding: 16, gap: 6, borderRadius: 20, borderWidth: 1 },
  top: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  num: { flexShrink: 1, fontFamily: Platform.select({ ios: "Menlo", default: "monospace" }), fontSize: 13.5 },
  pill: { borderRadius: 999, paddingHorizontal: 11, paddingVertical: 4 },
  title: { fontSize: 17, lineHeight: 23, marginTop: 2 },
  track: { height: 8, borderRadius: 4, overflow: "hidden", marginTop: 8 },
  fill: { height: 8, borderRadius: 4 },
  shadow: Platform.select({ ios: { shadowColor: "#0B1A33", shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } }, default: { elevation: 1 } })!,
});
