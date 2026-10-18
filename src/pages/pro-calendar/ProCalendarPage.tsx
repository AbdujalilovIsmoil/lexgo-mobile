import { useState } from "react";
import { DeadlineSheet, EventFormSheet } from "@/features/pro-event-form";
import type { CalEvent } from "@/entities/pro-calendar";
import { useHours } from "@/entities/pro-calendar";
import { useT } from "@/shared/i18n";
import { todayKey } from "@/shared/lib/pro/dates";
import { useKept } from "@/shared/lib/useKept";
import { AdminPage } from "@/shared/ui/admin";
import { CalendarView } from "@/widgets/pro-calendar-view";

// /pro/calendar — events (create / edit / delete), month · week · list views, deadline calculator.
export default function ProCalendarPage() {
  const { t } = useT();
  const hours = useHours().data;
  const [day, setDay] = useState(todayKey());
  const [sheet, setSheet] = useState<{ event: CalEvent | null } | null>(null);
  const [calc, setCalc] = useState(false);
  const kept = useKept(sheet);
  return (
    <AdminPage title={t("aw6.title")} subtitle={hours ? t(hours.working ? "aw6.hoursOpen" : "aw6.hoursClosed", { start: hours.start, end: hours.end }) : t("aw6.sub")}>
      <CalendarView selected={day} onDay={setDay} onOpen={(event) => setSheet({ event })} onAdd={() => setSheet({ event: null })} onCalc={() => setCalc(true)} />
      <EventFormSheet visible={!!sheet} onClose={() => setSheet(null)} event={kept?.event ?? null} day={day} />
      <DeadlineSheet visible={calc} onClose={() => setCalc(false)} />
    </AdminPage>
  );
}
