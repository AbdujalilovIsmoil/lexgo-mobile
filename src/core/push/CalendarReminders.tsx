import { useEffect } from "react";
import { useEvents, isCancelled } from "@/entities/pro-calendar";
import { useT } from "@/shared/i18n";
import { syncReminders } from "@/shared/push";

// Mirrors the user's calendar reminders (reminder_minutes_before) as OS alarms so they ring offline.
// The server schedule stays the source of truth; this re-syncs whenever the events change.
export function CalendarReminders() {
  const { t } = useT();
  const events = useEvents().data;
  useEffect(() => {
    if (!events) return;
    const list = events.filter((e) => !isCancelled(e) && e.reminderMinutes != null && e.startsAt).map((e) => ({
      id: e.id,
      title: e.title || t("nt10.title"),
      body: t("nt10.body", { min: e.reminderMinutes ?? 0 }),
      at: new Date(new Date(e.startsAt).getTime() - (e.reminderMinutes ?? 0) * 60000),
      data: { entity_type: "calendar_event", entity_id: e.id },
    })).filter((r) => !Number.isNaN(r.at.getTime()));
    void syncReminders(list);
  }, [events, t]);
  return null;
}
