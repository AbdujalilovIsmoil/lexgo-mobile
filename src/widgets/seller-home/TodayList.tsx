import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Calendar, ChevronRight, Sun } from "lucide-react-native";
import { isCancelled, tintOf, type CalEvent } from "@/entities/pro-calendar";
import type { CabinetCase } from "@/entities/pro-workspace";
import { fmtTime, isoDay } from "@/shared/lib/format";
import { radius, useColors } from "@/shared/theme";
import { PressableScale, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { SectionHead } from "./SectionHead";

const SOON = 3;
type Row = { key: string; time: string; day: string; title: string; chip: string; tint: string; to: string };

// "Bugun": today's court dates, meetings and deadlines, then the cases due today — each its own card: the time (blue) over the short date on
// the left, a hairline, then the title and a tinted chip with the kind. A quiet day shows the next few calendar items ("Yaqinda") instead, an
// empty calendar one card that opens it. "Kalendar" opens the full calendar.
export function TodayList({ events, due }: { events: CalEvent[]; due: CabinetCase[] }) {
  const { t, tList } = useT();
  const c = useColors();
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
  const eventRow = (e: CalEvent): Row => ({ key: `e${e.id}`, time: fmtTime(e.startsAt), day: shortDay(e.startsAt), title: e.title, chip: typeLabel(e.type), tint: tintOf(e.type), to: cal });
  const rows: Row[] = soon.length
    ? soon.map(eventRow)
    : [
        ...todays.map(eventRow),
        ...due.map((x): Row => ({ key: `c${x.id}`, time: t("shm.ws.today"), day: shortDay(new Date(now).toISOString()), title: x.nextAction || x.title, chip: t("shm.ws.caseDue"), tint: "#E8662E", to: `/pro/cases/${x.id}` })),
      ];
  return (
    <View style={s.col}>
      <SectionHead icon={Calendar} title={t(soon.length ? "shm.ws.soon" : "shm.ws.today")} link={t("shm.ws.calendar")} onLink={() => router.push(cal as never)} />
      {rows.length ? rows.map((r) => (
        <PressableScale key={r.key} onPress={() => router.push(r.to as never)} scale={0.99} accessibilityRole="button" accessibilityLabel={`${r.time}, ${r.title}`} style={[s.card, { backgroundColor: c.glassFill, borderColor: c.glassLine }]}>
          <View style={s.when}>
            <Text variant="h4" weight="bold" tone="accent" numberOfLines={1} adjustsFontSizeToFit>{r.time}</Text>
            <Text variant="caption" tone="gray" numberOfLines={1}>{r.day}</Text>
          </View>
          <View style={[s.sep, { backgroundColor: c.line }]} />
          <View style={s.txt}>
            <Text variant="body" weight="bold" numberOfLines={2}>{r.title}</Text>
            <View style={[s.chip, { backgroundColor: `${r.tint}1F` }]}>
              <View style={[s.dot, { backgroundColor: r.tint }]} />
              <Text variant="caption" weight="bold" numberOfLines={1} style={{ color: r.tint }}>{r.chip}</Text>
            </View>
          </View>
          <ChevronRight size={20} color={c.gray} />
        </PressableScale>
      )) : (
        <PressableScale onPress={() => router.push(cal as never)} scale={0.99} accessibilityRole="button" style={[s.card, { backgroundColor: c.glassFill, borderColor: c.glassLine }]}>
          <View style={[s.ico, { backgroundColor: c.tint2 }]}><Sun size={20} color={c.accent} /></View>
          <View style={s.txt}>
            <Text variant="body" weight="bold">{t("shm.ws.todayEmpty")}</Text>
            <Text variant="small" tone="gray">{t("shm.ws.todayEmptySub")}</Text>
          </View>
          <ChevronRight size={20} color={c.gray} />
        </PressableScale>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  col: { gap: 12 },
  card: { flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 16, paddingVertical: 14, borderRadius: radius.rl, borderWidth: 1 },
  when: { width: 74, gap: 2 },
  sep: { width: 1, alignSelf: "stretch" },
  txt: { flex: 1, minWidth: 0, gap: 6 },
  chip: { flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  ico: { width: 44, height: 44, borderRadius: 13, alignItems: "center", justifyContent: "center" },
});
