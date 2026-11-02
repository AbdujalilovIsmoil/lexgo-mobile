import { Fragment, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { isCancelled, tintOf, type CalEvent } from "@/entities/pro-calendar";
import type { CabinetCase } from "@/entities/pro-workspace";
import { fmtDate, fmtTime, isoDay } from "@/shared/lib/format";
import { radius, useColors } from "@/shared/theme";
import { Icon, Pill, PressableScale, Text, type IconName } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { Fade } from "./Fade";

const ICON: Record<string, IconName> = { hearing: "briefcase", investigative: "search", meeting: "video", filing_deadline: "file-text", appeal_deadline: "flag" };
const DEADLINE = new Set(["filing_deadline", "appeal_deadline"]);
const SOON = 3;

type Row = { key: string; icon: IconName; tint: string; title: string; sub: string; pill?: { label: string; tone: "err" | "warn" }; to: string };

// "Bugun": today's court dates, meetings and deadlines from the calendar, then the cases due today — each a row with its time and place
// and a "Muddat" / "Bugun" pill where a date is at stake. A quiet day shows the next few calendar items ("Yaqinda") instead, and an empty
// calendar a short line. "Kalendar" opens the full calendar.
export function TodayPanel({ events, due, i }: { events: CalEvent[]; due: CabinetCase[]; i: number }) {
  const { t, locale } = useT();
  const c = useColors();
  const router = useRouter();
  const [now] = useState(Date.now); // read once when the home opens; a pull to refresh re-reads the events
  const today = isoDay(new Date(now));
  const live = events.filter((e) => !isCancelled(e)).sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  const dayOf = (iso: string) => (iso ? isoDay(new Date(iso)) : "");
  const todays = live.filter((e) => dayOf(e.startsAt) === today);
  const soon = todays.length || due.length ? [] : live.filter((e) => Date.parse(e.endsAt || e.startsAt) >= now).slice(0, SOON);
  const cal = "/pro/calendar";
  const eventRow = (e: CalEvent, withDate: boolean): Row => ({
    key: `e${e.id}`,
    icon: ICON[e.type] ?? "calendar",
    tint: tintOf(e.type),
    title: e.title,
    sub: [withDate ? fmtDate(e.startsAt, locale) : "", fmtTime(e.startsAt), e.location].filter(Boolean).join(" · "),
    pill: DEADLINE.has(e.type) ? { label: t("shm.ws.due"), tone: "err" } : undefined,
    to: cal,
  });
  const rows: Row[] = soon.length
    ? soon.map((e) => eventRow(e, true))
    : [
        ...todays.map((e) => eventRow(e, false)),
        ...due.map((x): Row => ({ key: `c${x.id}`, icon: "file-text", tint: "#E8662E", title: x.nextAction || x.title, sub: [t("shm.ws.caseDue"), x.number].filter(Boolean).join(" · "), pill: { label: t("shm.ws.today"), tone: "warn" }, to: `/pro/cases/${x.id}` })),
      ];
  return (
    <Fade i={i}>
      <View style={s.col}>
        <View style={s.head}>
          <Text variant="caption" weight="bold" tone="gray" style={s.kick}>{t(soon.length ? "shm.ws.soon" : "shm.ws.today").toUpperCase()}</Text>
          <PressableScale onPress={() => router.push(cal as never)} hitSlop={10} accessibilityRole="link"><Text variant="small" weight="bold" tone="accent">{t("shm.ws.calendar")}</Text></PressableScale>
        </View>
        <View style={[s.card, { backgroundColor: c.glassFill, borderColor: c.glassLine }]}>
          {rows.length ? rows.map((r, k) => (
            <Fragment key={r.key}>
              {k ? <View style={[s.rule, { backgroundColor: c.line }]} /> : null}
              <PressableScale onPress={() => router.push(r.to as never)} scale={0.99} accessibilityRole="button" accessibilityLabel={`${r.title}, ${r.sub}`} style={s.row}>
                <View style={[s.ico, { backgroundColor: `${r.tint}1F` }]}><Icon name={r.icon} size={18} color={r.tint} /></View>
                <View style={s.txt}>
                  <Text variant="body" weight="bold" numberOfLines={2}>{r.title}</Text>
                  {r.sub ? <Text variant="small" tone="gray" numberOfLines={1}>{r.sub}</Text> : null}
                </View>
                {r.pill ? <Pill label={r.pill.label} tone={r.pill.tone} small /> : null}
                <Icon name="chevron-right" size={18} color={c.gray} />
              </PressableScale>
            </Fragment>
          )) : (
            <PressableScale onPress={() => router.push(cal as never)} scale={0.99} accessibilityRole="button" style={s.row}>
              <View style={[s.ico, { backgroundColor: c.tint2 }]}><Icon name="sun" size={18} color={c.accent} /></View>
              <View style={s.txt}>
                <Text variant="body" weight="bold">{t("shm.ws.todayEmpty")}</Text>
                <Text variant="small" tone="gray">{t("shm.ws.todayEmptySub")}</Text>
              </View>
              <Icon name="chevron-right" size={18} color={c.gray} />
            </PressableScale>
          )}
        </View>
      </View>
    </Fade>
  );
}

const s = StyleSheet.create({
  col: { gap: 10 },
  head: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 4 },
  kick: { letterSpacing: 0.8 },
  card: { borderRadius: radius.rl, borderWidth: 1, overflow: "hidden" },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 14 },
  rule: { height: StyleSheet.hairlineWidth, marginLeft: 72 },
  ico: { width: 44, height: 44, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  txt: { flex: 1, minWidth: 0, gap: 2 },
});
