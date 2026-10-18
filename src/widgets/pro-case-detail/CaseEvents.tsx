import { useState } from "react";
import { View } from "react-native";
import { EventFormSheet } from "@/features/pro-event-form";
import { EventRow, useEvents, type CalEvent } from "@/entities/pro-calendar";
import { useT } from "@/shared/i18n";
import { todayKey } from "@/shared/lib/pro/dates";
import { useKept } from "@/shared/lib/useKept";
import { EmptyTile, SectionHead } from "./CaseSection";

// Calendar events linked to this case, with a shortcut to schedule one for it.
export function CaseEvents({ caseId }: { caseId: string }) {
  const { t } = useT();
  const q = useEvents();
  const [sheet, setSheet] = useState<{ event: CalEvent | null } | null>(null);
  const kept = useKept(sheet);
  const rows = (q.data ?? []).filter((e) => e.caseId === caseId);
  return (
    <View style={{ gap: 10 }}>
      <SectionHead title={t("aw5.tab.events")} onAdd={() => setSheet({ event: null })} label={t("aw5.addEvent")} />
      {rows.length ? rows.map((e) => <EventRow key={e.id} event={e} withDate onPress={() => setSheet({ event: e })} />) : <EmptyTile icon="calendar" text={t("aw5.noEvents")} />}
      <EventFormSheet visible={!!sheet} onClose={() => setSheet(null)} event={kept?.event ?? null} day={todayKey()} presetCase={caseId} />
    </View>
  );
}
