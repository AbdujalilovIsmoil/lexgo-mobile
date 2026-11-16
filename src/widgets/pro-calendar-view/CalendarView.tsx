import { useState } from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import type { CalEvent } from "@/entities/pro-calendar";
import { useT } from "@/shared/i18n";
import { useInsets } from "@/shared/lib/insets";
import { dayKey, todayKey } from "@/shared/lib/pro/dates";
import { ErrorView, FilterSeg, Skeleton } from "@/shared/ui";
import { DayAgenda } from "./DayAgenda";
import { EventList } from "./EventList";
import { MonthGrid } from "./MonthGrid";
import { Upcoming } from "./Upcoming";
import { WeekView } from "./WeekView";
import { useCalendarModel } from "./useCalendarModel";

type Mode = "month" | "week" | "list";
// `onAdd` / `onCalc` live in the page header now (the "+" and the deadline calculator); kept here for the callers.
type Props = { onOpen: (e: CalEvent) => void; onDay: (day: string) => void; selected: string; onAdd: () => void; onCalc: () => void };

// Calendar body (Adliya): the view switch, then the month card and the chosen day's agenda and the upcoming events, or the week agenda, or
// the flat list; pull to refresh. Adding an event and the deadline calculator are the page header's buttons.
export function CalendarView({ onOpen, onDay, selected }: Props) {
  const { t } = useT();
  const insets = useInsets();
  const { query, events, byDay, upcoming } = useCalendarModel(todayKey());
  const [mode, setMode] = useState<Mode>("month");
  const now = new Date();
  const [ym, setYm] = useState({ y: now.getFullYear(), m: now.getMonth() });
  const step = (d: number) => setYm(({ y, m }) => ({ y: y + Math.floor((m + d) / 12), m: (m + d + 12) % 12 }));
  const pick = (key: string) => {
    onDay(key);
    const [y, m] = key.split("-").map(Number);
    if (m - 1 !== ym.m || y !== ym.y) setYm({ y, m: m - 1 });
  };
  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: insets.bottom + 40 }} refreshControl={<RefreshControl refreshing={query.isRefetching} onRefresh={() => void query.refetch()} />} showsVerticalScrollIndicator={false}>
      <FilterSeg fill compact options={[{ value: "month", label: t("aw6.view.month") }, { value: "week", label: t("aw6.view.week") }, { value: "list", label: t("aw6.view.list") }]} value={mode} onChange={setMode} />
      {query.isLoading ? <Skeleton height={300} round={20} /> : query.isError ? <ErrorView error={query.error} onRetry={() => void query.refetch()} /> : mode === "month" ? (
        <View style={{ gap: 14 }}>
          <MonthGrid year={ym.y} month={ym.m} selected={selected} byDay={byDay} onSelect={pick} onStep={step} />
          <DayAgenda day={selected} events={byDay.get(selected) ?? []} onOpen={onOpen} />
          <Upcoming events={upcoming.filter((e) => dayKey(e.startsAt) !== selected).slice(0, 5)} onOpen={onOpen} />
        </View>
      ) : mode === "week" ? <WeekView byDay={byDay} onOpen={onOpen} /> : <EventList events={events} onOpen={onOpen} />}
    </ScrollView>
  );
}
