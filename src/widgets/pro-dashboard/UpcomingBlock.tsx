import { useState } from "react";
import { useRouter } from "expo-router";
import { EventRow, type CalEvent } from "@/entities/pro-calendar";
import { EventFormSheet } from "@/features/pro-event-form";
import { useT } from "@/shared/i18n";
import { todayKey } from "@/shared/lib/pro/dates";
import { useKept } from "@/shared/lib/useKept";
import { Text } from "@/shared/ui";
import { SectionCard } from "@/shared/ui/admin";

// Next few calendar events; tap to edit in place, "All" opens the calendar.
export function UpcomingBlock({ events }: { events: CalEvent[] }) {
  const { t } = useT();
  const router = useRouter();
  const [sel, setSel] = useState<CalEvent | null>(null);
  const [open, setOpen] = useState(false);
  const kept = useKept(sel);
  return (
    <SectionCard title={t("aw1.up.title")} action={{ label: t("aw1.all"), onPress: () => router.push("/pro/calendar" as never) }}>
      {events.length ? events.map((e) => <EventRow key={e.id} event={e} withDate onPress={() => { setSel(e); setOpen(true); }} />) : <Text variant="small" tone="gray">{t("aw1.up.empty")}</Text>}
      <EventFormSheet visible={open} onClose={() => setOpen(false)} event={kept} day={todayKey()} />
    </SectionCard>
  );
}
