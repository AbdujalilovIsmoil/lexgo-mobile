import type { ExpGroup, ExpHistory, ExpRecord, ExpReview, ExpStatus } from "../model/types";

export type ExpField = "category" | "subcategory" | "workplace" | "position" | "dates" | "description" | "stages" | "results" | "evidence";
export type ExpState = "approved" | "pending" | "rejected" | "cancelled" | "other";
export type ExpNote = { kind: "pending" | "rejected" | "cancelled"; record: ExpRecord; changed: ExpField[] };
export type ExpCard = {
  shown: ExpRecord; // the data on the card: the verified revision, else the newest one
  state: ExpState; // its pill
  note: ExpNote | null; // a newer revision next to the verified one
  pendingId: string; // what "cancel review" withdraws
};

const STATE: Partial<Record<ExpStatus, ExpState>> = { approved: "approved", pending_review: "pending", rejected: "rejected", cancelled: "cancelled" };
const NOTE: Partial<Record<ExpStatus, ExpNote["kind"]>> = { pending_review: "pending", rejected: "rejected", cancelled: "cancelled" };

const same = (a: string[], b: string[]) => a.length === b.length && a.every((x) => b.includes(x));

// What a revision changed against an earlier one ("Changed: position, files").
function changedFields(a: ExpRecord, b: ExpRecord): ExpField[] {
  const out: ExpField[] = [];
  if (a.categoryId !== b.categoryId) out.push("category");
  if (a.subcategoryId !== b.subcategoryId) out.push("subcategory");
  if (a.workplace.trim() !== b.workplace.trim()) out.push("workplace");
  if (a.position.trim() !== b.position.trim()) out.push("position");
  if (a.startedAt.slice(0, 10) !== b.startedAt.slice(0, 10) || a.endedAt.slice(0, 10) !== b.endedAt.slice(0, 10) || a.isCurrent !== b.isCurrent) out.push("dates");
  if (a.description.trim() !== b.description.trim()) out.push("description");
  if (!same(a.stages, b.stages)) out.push("stages");
  if (!same(a.results, b.results)) out.push("results");
  if (!same(a.evidence.map((e) => e.id), b.evidence.map((e) => e.id))) out.push("evidence");
  return out;
}

// One entry as the seller sees it (§3.5, §3.6): the verified data stays on the card while an edit waits, is rejected or withdrawn — that
// edit is a note under it. Without a verified revision the newest one is shown with its own state.
export function cardOf(g: ExpGroup): ExpCard | null {
  const shown = g.current ?? g.latest ?? g.pending;
  if (!shown) return null;
  const newer = g.pending ?? g.latest;
  const kind = g.current && newer && newer.id !== g.current.id ? NOTE[newer.status] : undefined;
  const pending = g.pending ?? (g.latest?.status === "pending_review" ? g.latest : null);
  return {
    shown,
    state: g.current ? "approved" : pending ? "pending" : (STATE[shown.status] ?? "other"),
    note: kind && newer && g.current ? { kind, record: newer, changed: changedFields(g.current, newer) } : null,
    pendingId: pending?.id ?? "",
  };
}

export type ExpEvent =
  | { kind: "sent"; key: string; at: string; record: ExpRecord; changed: ExpField[] }
  | { kind: "review"; key: string; at: string; review: ExpReview; version: number | null };

const ts = (s: string) => Date.parse(s) || 0;

// The history as one list, newest first: each revision when it was sent (and what it changed), each decision when it was made.
export function timelineOf(h: ExpHistory): ExpEvent[] {
  const sent: ExpEvent[] = h.revisions.map((r, i) => ({ kind: "sent", key: `s:${r.id}`, at: r.submittedAt, record: r, changed: i ? changedFields(h.revisions[i - 1], r) : [] }));
  const version = (id: string) => h.revisions.find((r) => r.id === id)?.version ?? null;
  const decided: ExpEvent[] = h.reviews.map((rv, i) => ({ kind: "review", key: `r:${rv.id || i}`, at: rv.reviewedAt, review: rv, version: version(rv.experienceId) }));
  // A decision made in the same second as a submission still comes after it.
  return [...sent, ...decided].sort((a, b) => ts(b.at) - ts(a.at) || (a.kind === b.kind ? 0 : a.kind === "review" ? -1 : 1));
}
