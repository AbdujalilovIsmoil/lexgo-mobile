import { View } from "react-native";
import { EventRow, type CalEvent } from "@/entities/pro-calendar";
import { useT } from "@/shared/i18n";
import { fmtDate } from "@/shared/lib/format";
import { todayKey } from "@/shared/lib/pro/dates";
import { Icon, Text } from "@/shared/ui";
import { useColors } from "@/shared/theme";

type Props = { day: string; events: CalEvent[]; onOpen: (e: CalEvent) => void; showEmpty?: boolean };

// One day's agenda: a date heading and its events (or the empty hint).
export function DayAgenda({ day, events, onOpen, showEmpty = true }: Props) {
  const { t, locale } = useT();
  const c = useColors();
  if (!events.length && !showEmpty) return null;
  return (
    <View style={{ gap: 8 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}><Text variant="h4">{day === todayKey() ? t("aw6.today") : fmtDate(day, locale)}</Text>{events.length ? <View style={{ paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, backgroundColor: c.tint2 }}><Text variant="caption" weight="bold" tone="accent">{events.length}</Text></View> : null}</View>
      {events.length ? events.map((e, i) => <EventRow key={e.id} index={i} event={e} onPress={() => onOpen(e)} />) : <View style={{ alignItems: "center", gap: 8, paddingVertical: 14, borderRadius: 18, backgroundColor: c.surface2 }}><Icon name="calendar" size={22} tone="gray" /><Text variant="small" tone="gray">{t("cal.none")}</Text></View>}
    </View>
  );
}
