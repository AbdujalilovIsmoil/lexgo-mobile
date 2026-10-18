import type { DocReq } from "../model/types";
import { LATE_MS } from "../model/status";
import type { DocTab } from "../model/status";

// Statuses where somebody is still waiting for the advocate.
const WAITING = ["open_pool", "new", "claimed", "pending_payment"];

export type Ago = { unit: "now" | "min" | "hour" | "day"; n: number } | null;
// Relative age as a unit + number (the caller words it): null for a missing / future date.
export function agoOf(iso: string | undefined, now: number = Date.now()): Ago {
  const ms = iso ? now - Date.parse(iso) : NaN;
  if (!Number.isFinite(ms) || ms < 0) return null;
  const m = Math.floor(ms / 60000);
  if (m < 1) return { unit: "now", n: 0 };
  if (m < 60) return { unit: "min", n: m };
  const h = Math.floor(m / 60);
  return h < 24 ? { unit: "hour", n: h } : { unit: "day", n: Math.floor(h / 24) };
}

// Over 24 h since the client asked and the request is still open on the advocate's side.
export const isLate = (d: Pick<DocReq, "status" | "createdAt">, now: number = Date.now()): boolean => {
  const born = Date.parse(d.createdAt);
  return WAITING.includes(d.status) && Number.isFinite(born) && now - born > LATE_MS;
};

export type SummaryTile = { key: "work" | "fresh" | "sent"; tab: DocTab; n: number };
// The three tiles above the list, straight from the tab counts; each one jumps to its tab.
export const summaryOf = (counts: Record<string, number>): SummaryTile[] => [
  { key: "work", tab: "claimed", n: counts.claimed ?? 0 },
  { key: "fresh", tab: "new", n: counts.new ?? 0 },
  { key: "sent", tab: "completed", n: counts.completed ?? 0 },
];

// How many requests of each work type the current list holds (for the filter sheet's tiles).
export function flowCounts(rows: DocReq[]): Record<string, number> {
  const c: Record<string, number> = { all: rows.length };
  for (const r of rows) if (r.flow) c[r.flow] = (c[r.flow] ?? 0) + 1;
  return c;
}

export type StepKey = "new" | "work" | "sent";
export type StepState = "done" | "now" | "todo" | "fail";
// Where a request is on new → in progress → sent (a stopped one fails at the working step).
export function stepsOf(status: string): { key: StepKey; state: StepState }[] {
  const at = (n: StepState, w: StepState, s: StepState) => [{ key: "new" as const, state: n }, { key: "work" as const, state: w }, { key: "sent" as const, state: s }];
  if (status === "claimed") return at("done", "now", "todo");
  if (status === "completed") return at("done", "done", "done");
  if (status === "cancelled" || status === "rejected") return at("done", "fail", "todo");
  return at("now", "todo", "todo");
}

// A long client request is cut for the sheet; the caller offers "more".
export function cutText(s: string, max = 180): { text: string; cut: boolean } {
  const v = s.trim();
  return v.length > max ? { text: `${v.slice(0, max - 1).trimEnd()}…`, cut: true } : { text: v, cut: false };
}
