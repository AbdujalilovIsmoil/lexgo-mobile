import type { ExpCategory, ExpInput } from "../model/types";

export const DESCRIPTION_MIN = 30;
// Phone numbers, e-mails, Telegram handles and links do not belong in the description (contact stays inside LexGo).
const CONTACT = /(\+?\d[\d\s\-()]{7,}\d)|([^\s@]+@[^\s@]+\.[^\s@]+)|(@[a-z0-9_]{4,})|(t\.me\/|https?:\/\/|www\.)/i;

export type ExpIssue = "category" | "subcategory" | "workplace" | "position" | "started" | "ended" | "description" | "contacts";

// The values a list holds that the app does not offer (an older record's stage or result): shown so they are never sent again unseen.
export const strayValues = (value: string[], offered: readonly string[]): string[] => value.filter((v) => !offered.includes(v));

// The web's checks before an experience goes to review; `today` is "YYYY-MM-DD" (injectable for tests). With the category tree loaded, a
// category or direction it does not have (an older record) is flagged too: the backend accepts only real ids (§3.1).
export function expIssues(i: ExpInput, today: string, tree?: ExpCategory[]): ExpIssue[] {
  const out: ExpIssue[] = [];
  const cat = tree?.find((c) => c.id === i.categoryId);
  if (!i.categoryId || (tree?.length && !cat)) out.push("category");
  if (i.subcategoryId && cat && !cat.children.some((c) => c.id === i.subcategoryId)) out.push("subcategory");
  if (!i.workplace.trim()) out.push("workplace");
  if (!i.position.trim()) out.push("position");
  if (!i.startedOn || i.startedOn > today) out.push("started");
  if (!i.isCurrent && (!i.endedOn || i.endedOn < i.startedOn || i.endedOn > today)) out.push("ended");
  if (i.description.trim().length < DESCRIPTION_MIN) out.push("description");
  else if (CONTACT.test(i.description)) out.push("contacts");
  return out;
}
