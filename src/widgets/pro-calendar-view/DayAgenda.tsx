import { View } from "react-native";
import type { CalEvent } from "@/entities/pro-calendar";
import { useT } from "@/shared/i18n";
import { fmtDate } from "@/shared/lib/format";
import { todayKey } from "@/shared/lib/pro/dates";
import { Icon, Text } from "@/shared/ui";
import { useTheme } from "@/shared/theme";
import { AgendaGroup } from "./AgendaGroup";

type Props = { day: string; events: CalEvent[]; onOpen: (e: CalEvent) => void; showEmpty?: boolean };

// One day's agenda: the date in small grey capitals ("13-NOYABR", or "BUGUN") and its events as one white card (or the empty hint).
export function DayAgenda({ day, events, onOpen, showEmpty = true }: Props) {
  const { t, locale } = useT();
  const { colors: c, dark, glass } = useTheme();
  if (!events.length && !showEmpty) return null;
  return (
    <View style={{ gap: 10 }}>
      <Text variant="small" weight="bold" tone="gray" style={{ letterSpacing: 0.8, marginLeft: 4 }}>{(day === todayKey() ? t("aw6.today") : fmtDate(day, locale)).toUpperCase()}</Text>
      {events.length ? <AgendaGroup events={events} onOpen={onOpen} /> : (
        <View style={{ alignItems: "center", gap: 8, paddingVertical: 18, borderRadius: 20, borderWidth: 1, borderColor: dark || glass ? c.line : "#E6EBF3", backgroundColor: dark || glass ? c.surface : "#FFFFFF" }}>
          <Icon name="calendar" size={22} tone="gray" />
          <Text variant="small" tone="gray">{t("cal.none")}</Text>
        </View>
      )}
    </View>
  );
}
