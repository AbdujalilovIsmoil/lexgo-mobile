import { useState } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { ChevronRight, Sun } from "lucide-react-native";
import { isCancelled, type CalEvent } from "@/entities/pro-calendar";
import type { CabinetCase } from "@/entities/pro-workspace";
import { fmtTime, isoDay } from "@/shared/lib/format";
import { useTheme } from "@/shared/theme";
import { PressableScale, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";

const SOON = 3;
type Row = { key: string; time: string; day: string; title: string; sub?: string; chip: string; tint: string; to: string };

// "Kun tartibi" (Adliya): today's court dates, meetings and deadlines, then the cases due today, as rows of one white card — the time in bold
// on the left, the title with its kind · place under it, a red chip for a deadline / a case due. A quiet day shows the next few calendar items ("Yaqinda") instead, an
// empty calendar one card that opens it. "Kalendar" opens the full calendar.
export function TodayList({ events, due }: { events: CalEvent[]; due: CabinetCase[] }) {
  const { t, tList } = useT();
  const { colors: c, dark, glass } = useTheme();
  const router = useRouter();
  const [now] = useState(Date.now);
  const today = isoDay(new Date(now));
  const cal = "/pro/calendar";
  const months = tList("aw11.months");
  const weekdays = tList("aw11.weekdays");
  const shortDay = (iso: string) => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    const m = (months[d.getMonth()] ?? "").slice(0, 3).toLowerCase();
    const w = weekdays[(d.getDay() + 6) % 7] ?? "";
    return [`${d.getDate()} ${m}`.trim(), w].filter(Boolean).join(", ");
  };
  const typeLabel = (type: string) => { const k = `aw11.eventType.${type}`; const v = t(k); return v === k ? t("aw11.eventType.deadline") : v; };
  const live = events.filter((e) => !isCancelled(e)).sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  const dayOf = (iso: string) => (iso ? isoDay(new Date(iso)) : "");
  const todays = live.filter((e) => dayOf(e.startsAt) === today);
  const soon = todays.length || due.length ? [] : live.filter((e) => Date.parse(e.endsAt || e.startsAt) >= now).slice(0, SOON);
  const eventRow = (e: CalEvent): Row => ({ key: `e${e.id}`, time: fmtTime(e.startsAt), day: shortDay(e.startsAt), title: e.title, sub: [typeLabel(e.type), e.location].filter(Boolean).join(" · "), chip: e.type.endsWith("_deadline") ? t("cdash.pro.due") : "", tint: "#D1343B", to: cal });
  const rows: Row[] = soon.length
    ? soon.map(eventRow)
    : [
        ...todays.map(eventRow),
        ...due.map((x): Row => ({ key: `c${x.id}`, time: t("shm.ws.today"), day: shortDay(new Date(now).toISOString()), title: x.nextAction || x.title, sub: [x.number, x.nextAction ? x.title : ""].filter(Boolean).join(" · "), chip: t("shm.ws.caseDue"), tint: "#D1343B", to: `/pro/cases/${x.id}` })),
      ];
  const card = { backgroundColor: dark || glass ? c.surface : "#FFFFFF", borderColor: dark || glass ? c.line : "#E6EBF3" };
  const line = dark || glass ? c.line : "#E9EEF5";
  return (
    <View style={s.col}>
      <View style={s.head}>
        <Text variant="h4" weight="bold" style={s.h}>{t(soon.length ? "shm.ws.soon" : "cdash.pro.agenda")}</Text>
        <PressableScale onPress={() => router.push(cal as never)} hitSlop={8} accessibilityRole="button">
          <Text variant="small" weight="bold" tone="accent" style={s.link}>{t("cdash.pro.calendar")}</Text>
        </PressableScale>
      </View>
      <View style={[s.card, card, !glass && s.shadow]}>
        {rows.length ? rows.map((r, i) => (
          <PressableScale key={r.key} onPress={() => router.push(r.to as never)} scale={0.99} accessibilityRole="button" accessibilityLabel={`${r.time}, ${r.title}`} style={[s.row, i > 0 && { borderTopWidth: 1, borderTopColor: line }]}>
            <View style={s.when}>
              <Text variant="body" weight="bold" numberOfLines={1} adjustsFontSizeToFit style={{ color: c.ink }}>{r.time}</Text>
              {soon.length ? <Text variant="caption" tone="gray" numberOfLines={1}>{r.day}</Text> : null}
            </View>
            <View style={s.txt}>
              <Text variant="body" weight="semibold" numberOfLines={2} style={s.title}>{r.title}</Text>
              {r.sub ? <Text variant="small" tone="gray" numberOfLines={1}>{r.sub}</Text> : null}
            </View>
            {r.chip ? <View style={[s.chip, { backgroundColor: `${r.tint}1F` }]}><Text variant="caption" weight="bold" numberOfLines={1} style={{ color: r.tint }}>{r.chip}</Text></View> : null}
          </PressableScale>
        )) : (
          <PressableScale onPress={() => router.push(cal as never)} scale={0.99} accessibilityRole="button" style={s.row}>
            <View style={[s.ico, { backgroundColor: c.tint2 }]}><Sun size={20} color={c.accent} /></View>
            <View style={s.txt}>
              <Text variant="body" weight="bold">{t("cdash.pro.agendaEmpty")}</Text>
              <Text variant="small" tone="gray">{t("cdash.pro.agendaEmptySub")}</Text>
            </View>
            <ChevronRight size={20} color={c.gray} />
          </PressableScale>
        )}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  col: { gap: 12 },
  head: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  h: { fontSize: 19, lineHeight: 25 },
  link: { fontSize: 15 },
  card: { borderRadius: 20, borderWidth: 1, overflow: "hidden" },
  row: { flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 18, paddingVertical: 16 },
  when: { width: 58, gap: 2 },
  txt: { flex: 1, minWidth: 0, gap: 3 },
  title: { fontSize: 15.5, lineHeight: 21 },
  chip: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, maxWidth: 110 },
  ico: { width: 44, height: 44, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  shadow: Platform.select({ ios: { shadowColor: "#0B1A33", shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } }, default: { elevation: 1 } })!,
});
