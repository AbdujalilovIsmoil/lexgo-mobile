import { useState } from "react";
import { View } from "react-native";
import { EventRow, type CalEvent } from "@/entities/pro-calendar";
import { useT } from "@/shared/i18n";
import { dayKey, todayKey } from "@/shared/lib/pro/dates";
import { EmptyState } from "@/shared/ui";
import { ChipBar } from "@/shared/ui/admin";

type Props = { events: CalEvent[]; onOpen: (e: CalEvent) => void };

// Flat list of events with an upcoming / past switch (past newest first).
export function EventList({ events, onOpen }: Props) {
  const { t } = useT();
  const [mode, setMode] = useState<"next" | "past">("next");
  const today = todayKey();
  const next = events.filter((e) => dayKey(e.startsAt) >= today);
  const past = events.filter((e) => dayKey(e.startsAt) < today).reverse();
  const rows = mode === "next" ? next : past;
  return (
    <View style={{ gap: 10 }}>
      <ChipBar options={[{ value: "next", label: t("aw6.upcoming"), count: next.length }, { value: "past", label: t("aw6.past"), count: past.length }]} value={mode} onChange={setMode} />
      {rows.length ? rows.map((e) => <EventRow key={e.id} event={e} withDate onPress={() => onOpen(e)} />) : <EmptyState icon="calendar" title={t("aw6.empty")} text={t("aw6.emptyText")} compact />}
    </View>
  );
}
