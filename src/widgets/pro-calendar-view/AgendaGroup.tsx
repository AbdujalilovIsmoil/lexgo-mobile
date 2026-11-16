import { Platform, StyleSheet, View } from "react-native";
import { isCancelled, type CalEvent } from "@/entities/pro-calendar";
import { useT } from "@/shared/i18n";
import { fmtDate } from "@/shared/lib/format";
import { tOr } from "@/shared/lib/pro/tOr";
import { hhmm } from "@/shared/lib/pro/dates";
import { useTheme } from "@/shared/theme";
import { Icon, PressableScale, Text, type IconName } from "@/shared/ui";

const ICON: Record<string, IconName> = { hearing: "briefcase", investigative: "search", meeting: "video", filing_deadline: "file-text", appeal_deadline: "file-text" };

// A day's (or the upcoming) events as rows of one white card (Adliya): the type's icon on a soft blue tile, the title, "10:30 · place" under
// it (the date too with `withDate`), a red "Muddat" chip for a deadline; a cancelled one is faded and struck through.
export function AgendaGroup({ events, onOpen, withDate }: { events: CalEvent[]; onOpen: (e: CalEvent) => void; withDate?: boolean }) {
  const { t, locale } = useT();
  const { colors: c, dark, glass } = useTheme();
  const line = dark || glass ? c.line : "#E9EEF5";
  return (
    <View style={[s.card, { backgroundColor: dark || glass ? c.surface : "#FFFFFF", borderColor: dark || glass ? c.line : "#E6EBF3" }, !glass && s.shadow]}>
      {events.map((e, i) => {
        const off = isCancelled(e);
        const deadline = e.type.endsWith("deadline");
        const sub = [withDate ? fmtDate(e.startsAt, locale) : "", hhmm(e.startsAt), e.location || tOr(t, `aw11.eventType.${e.type}`, "")].filter(Boolean).join(" · ");
        return (
          <PressableScale key={e.id} onPress={() => onOpen(e)} scale={0.99} accessibilityRole="button" accessibilityLabel={`${e.title}. ${sub}`} style={[s.row, i > 0 && { borderTopWidth: 1, borderTopColor: line }, off && s.off]}>
            <View style={[s.tile, { backgroundColor: c.tint2 }]}><Icon name={ICON[e.type] ?? "calendar"} size={19} color={c.accent} /></View>
            <View style={s.txt}>
              <Text variant="body" weight="semibold" numberOfLines={2} style={[s.title, off && s.strike]}>{e.title || tOr(t, `aw11.eventType.${e.type}`, e.type)}</Text>
              {sub ? <Text variant="small" tone="gray" numberOfLines={1}>{sub}</Text> : null}
            </View>
            {off ? <View style={[s.chip, { backgroundColor: c.surface2 }]}><Text variant="caption" weight="bold" tone="gray">{t("aw6.cancelled")}</Text></View>
              : deadline ? <View style={[s.chip, { backgroundColor: c.errBg }]}><Text variant="caption" weight="bold" style={{ color: c.err }}>{t("cdash.pro.due")}</Text></View> : null}
          </PressableScale>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  card: { borderRadius: 20, borderWidth: 1, overflow: "hidden" },
  row: { flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 16, paddingVertical: 14 },
  tile: { width: 44, height: 44, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  txt: { flex: 1, minWidth: 0, gap: 3 },
  title: { fontSize: 15.5, lineHeight: 21 },
  strike: { textDecorationLine: "line-through" },
  off: { opacity: 0.6 },
  chip: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  shadow: Platform.select({ ios: { shadowColor: "#0B1A33", shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } }, default: { elevation: 1 } })!,
});
