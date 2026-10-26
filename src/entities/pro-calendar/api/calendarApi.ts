import { http } from "@/shared/api";
import { asArr, asDict, asNum, asStr, listFrom } from "@/shared/lib/json";
import type { CalEvent, DeadlineKind, DeadlineResult, EventInput, Reminder } from "../model/types";

export function normEvent(v: unknown): CalEvent {
  const d = asDict(v);
  return {
    id: asStr(d.id),
    type: asStr(d.type, "meeting"),
    title: asStr(d.title),
    caseId: asStr(d.case_id),
    startsAt: asStr(d.starts_at),
    endsAt: asStr(d.ends_at),
    location: asStr(d.location),
    status: asStr(d.status, "active").toLowerCase(),
    reminderMinutes: d.reminder_minutes_before == null ? null : asNum(d.reminder_minutes_before),
    reminderScheduled: Boolean(d.reminder_scheduled),
  };
}

// GET /calendar-events — all of the user's events (plain array).
export async function listEvents(): Promise<CalEvent[]> {
  return listFrom(await http("/calendar-events"), "items", "data", "events")
    .map(normEvent)
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}
export const createEvent = async (body: EventInput): Promise<CalEvent> => normEvent(await http("/calendar-events", { method: "POST", body }));
export const updateEvent = async (id: string, body: Partial<EventInput> & { status?: string }): Promise<CalEvent> =>
  normEvent(await http(`/calendar-events/${encodeURIComponent(id)}`, { method: "PATCH", body }));
export async function deleteEvent(id: string): Promise<void> {
  await http(`/calendar-events/${encodeURIComponent(id)}`, { method: "DELETE" });
}
export const icalPath = (id: string): string => `/calendar-events/${encodeURIComponent(id)}/ical`;

// POST …/reminders/cascade — the server schedules its standard 7d/3d/1d/2h reminders.
export async function cascadeReminders(id: string): Promise<Reminder[]> {
  const d = asDict(await http(`/calendar-events/${encodeURIComponent(id)}/reminders/cascade`, { method: "POST" }));
  return asArr(d.reminders).map((x) => ({ minutesBefore: asNum(asDict(x).minutes_before), remindAt: asStr(asDict(x).remind_at) }));
}

// POST /calendar/deadline-calculator — procedural deadline from a base date (optionally adds the event).
export async function calcDeadline(i: { kind: DeadlineKind; baseDate: string; add: boolean; title: string }): Promise<DeadlineResult> {
  const d = asDict(await http("/calendar/deadline-calculator", { method: "POST", body: { kind: i.kind, base_date: i.baseDate, create_event: i.add, title: i.title || undefined } }));
  return { deadline: asStr(d.deadline), baseDate: asStr(d.base_date), added: Boolean(d.event) };
}

