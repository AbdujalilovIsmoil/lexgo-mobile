import { EXP_POSITIONS_MAX, type ExpCategory, type ExpInput, type ExpPositionInput } from "../model/types";

export const DESCRIPTION_MIN = 30;
// Phone numbers, e-mails, Telegram handles and links do not belong in the description (contact stays inside LexGo).
const CONTACT = /(\+?\d[\d\s\-()]{7,}\d)|([^\s@]+@[^\s@]+\.[^\s@]+)|(@[a-z0-9_]{4,})|(t\.me\/|https?:\/\/|www\.)/i;

export type ExpIssue = "category" | "subcategory" | "workplace" | "positions" | "description" | "contacts";
export type PosIssue = "title" | "started" | "ended";
export const TITLE_MIN = 2; // workplace and position title: 2–255 characters
export const TITLE_MAX = 255;

// One position row: a title, a start day, and an end day not before the start unless it is held now. Overlapping or parallel periods
// are fine: the backend merges them for the rating, so rows are never compared with each other.
export function posIssues(p: PosLike, today: string): PosIssue[] {
  const out: PosIssue[] = [];
  const title = p.title.trim().length;
  if (title < TITLE_MIN || title > TITLE_MAX) out.push("title");
  if (!p.startedOn || p.startedOn > today) out.push("started");
  if (!p.isCurrent && (!p.endedOn || p.endedOn < p.startedOn || p.endedOn > today)) out.push("ended");
  return out;
}
type PosLike = Pick<ExpPositionInput, "title" | "startedOn" | "endedOn" | "isCurrent">;

// The values a list holds that the app does not offer (an older record's stage or result): shown so they are never sent again unseen.
export const strayValues = (value: string[], offered: readonly string[]): string[] => value.filter((v) => !offered.includes(v));

// The web's checks before an experience goes to review; `today` is "YYYY-MM-DD" (injectable for tests). With the category tree loaded, a
// category or direction it does not have (an older record) is flagged too: the backend accepts only real ids (§3.1).
export function expIssues(i: ExpInput, today: string, tree?: ExpCategory[]): ExpIssue[] {
  const out: ExpIssue[] = [];
  const cat = tree?.find((c) => c.id === i.categoryId);
  if (!i.categoryId || (tree?.length && !cat)) out.push("category");
  if (i.subcategoryId && cat && !cat.children.some((c) => c.id === i.subcategoryId)) out.push("subcategory");
  const place = i.workplace.trim().length;
  if (place < TITLE_MIN || place > TITLE_MAX) out.push("workplace");
  if (!i.positions.length || i.positions.length > EXP_POSITIONS_MAX || i.positions.some((p) => posIssues(p, today).length)) out.push("positions");
  if (i.description.trim().length < DESCRIPTION_MIN) out.push("description");
  else if (CONTACT.test(i.description)) out.push("contacts");
  return out;
}
