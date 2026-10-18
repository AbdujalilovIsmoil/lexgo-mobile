export type CalEvent = {
  id: string;
  type: string;
  title: string;
  caseId: string;
  startsAt: string;
  endsAt: string;
  location: string;
  status: string; // active · scheduled · cancelled …
  reminderMinutes: number | null;
  reminderScheduled: boolean;
};

// Body of POST /calendar-events (PATCH takes the same keys, all optional).
export type EventInput = {
  type: string;
  title: string;
  starts_at: string;
  ends_at?: string | null;
  location?: string;
  case_id?: string | null;
  reminder_minutes_before?: number | null;
};

export type DeadlineKind = "appeal" | "document" | "complaint" | "general";
export type DeadlineResult = { deadline: string; baseDate: string; added: boolean };
export type Reminder = { minutesBefore: number; remindAt: string };
