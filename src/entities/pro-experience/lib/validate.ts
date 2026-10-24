import type { ExpInput } from "../model/types";

export const DESCRIPTION_MIN = 30;
// Phone numbers, e-mails, Telegram handles and links do not belong in the description (contact stays inside LexGo).
const CONTACT = /(\+?\d[\d\s\-()]{7,}\d)|([^\s@]+@[^\s@]+\.[^\s@]+)|(@[a-z0-9_]{4,})|(t\.me\/|https?:\/\/|www\.)/i;

export type ExpIssue = "category" | "workplace" | "position" | "started" | "ended" | "description" | "contacts";

// The web's checks before an experience goes to review; `today` is "YYYY-MM-DD" (injectable for tests).
export function expIssues(i: ExpInput, today: string): ExpIssue[] {
  const out: ExpIssue[] = [];
  if (!i.categoryId) out.push("category");
  if (!i.workplace.trim()) out.push("workplace");
  if (!i.position.trim()) out.push("position");
  if (!i.startedOn || i.startedOn > today) out.push("started");
  if (!i.isCurrent && (!i.endedOn || i.endedOn < i.startedOn || i.endedOn > today)) out.push("ended");
  if (i.description.trim().length < DESCRIPTION_MIN) out.push("description");
  else if (CONTACT.test(i.description)) out.push("contacts");
  return out;
}
