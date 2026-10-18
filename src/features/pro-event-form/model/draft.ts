import type { CalEvent } from "@/entities/pro-calendar";
import { dayKey, hhmm, toIso } from "@/shared/lib/pro/dates";

export type Draft = { type: string; title: string; date: string; start: string; end: string; location: string; reminder: string; caseId: string; cancelled: boolean };

export const draftOf = (e: CalEvent | null, day: string, caseId = ""): Draft => ({
  type: e?.type ?? "meeting",
  title: e?.title ?? "",
  date: e ? dayKey(e.startsAt) : day,
  start: e ? hhmm(e.startsAt) : "09:00",
  end: e?.endsAt ? hhmm(e.endsAt) : "",
  location: e?.location ?? "",
  reminder: String(e?.reminderMinutes ?? (e ? 0 : 30)),
  caseId: e?.caseId ?? caseId,
  cancelled: e?.status === "cancelled",
});

// Request body (ISO instants in the device time zone).
export function bodyOf(d: Draft, editing: boolean) {
  const mins = Number(d.reminder);
  return {
    type: d.type, title: d.title.trim(), starts_at: toIso(d.date, d.start), location: d.location.trim(),
    ...(d.end || editing ? { ends_at: d.end ? toIso(d.date, d.end) : null } : {}),
    ...(mins > 0 ? { reminder_minutes_before: mins } : editing ? { reminder_minutes_before: null } : {}),
    ...(d.caseId || editing ? { case_id: d.caseId || null } : {}),
  };
}
