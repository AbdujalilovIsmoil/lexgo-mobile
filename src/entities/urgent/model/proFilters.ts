import type { UrgentRequest } from "./requestTypes";
import { matches } from "./listTools";

export type ProSort = "attention" | "waiting" | "new" | "old";
export type ProPeriod = "all" | "today" | "week";
export type ProFilters = { q: string; status: string; period: ProPeriod; sort: ProSort };

export const PRO_SORTS: ProSort[] = ["attention", "waiting", "new", "old"];
export const PRO_PERIODS: ProPeriod[] = ["all", "today", "week"];
export const PRO_STATUSES = ["open_pool", "claimed", "scheduled", "in_progress", "meeting_active", "completed", "cancelled", "expired"];
export const NO_PRO_FILTERS: ProFilters = { q: "", status: "", period: "all", sort: "attention" };

const DAY = 86_400_000;
const FINAL = ["completed", "cancelled", "expired"];
const RANK: Record<string, number> = { meeting_active: 0, scheduled: 1, claimed: 2, in_progress: 2, open_pool: 3 };
const made = (r: UrgentRequest): number => Date.parse(r.createdAt) || 0;
const live = (r: UrgentRequest): boolean => !FINAL.includes(r.status);
const rank = (r: UrgentRequest): number => (live(r) ? (RANK[r.status] ?? 5) : 9);

// Where the job stands on the four-step track: assigned, accepted, in progress, done. -1 = it fell out (cancelled / expired).
export function stepOf(r: UrgentRequest): number {
  const s = r.status || "open_pool";
  if (s === "completed") return 3;
  if (s === "cancelled" || s === "expired") return -1;
  if (s === "scheduled" || s === "in_progress" || s === "meeting_active") return 2;
  return s === "claimed" ? 1 : 0;
}

// How long ago the request came in, split for display; `key` picks the translation, `n`/`m` fill it.
export function ageOf(ms: number): { key: "now" | "min" | "hour" | "day"; n: number; m: number } {
  const min = Math.max(0, Math.floor(ms / 60_000));
  if (min < 1) return { key: "now", n: 0, m: 0 };
  if (min < 60) return { key: "min", n: min, m: 0 };
  if (min < 1440) return { key: "hour", n: Math.floor(min / 60), m: min % 60 };
  return { key: "day", n: Math.floor(min / 1440), m: 0 };
}

// How hot an open job is by the time it has been waiting: under 15 min calm, under an hour warm, then hot.
export const heatOf = (ms: number): "calm" | "warm" | "hot" => (ms < 15 * 60_000 ? "calm" : ms < 60 * 60_000 ? "warm" : "hot");

function inPeriod(r: UrgentRequest, p: ProPeriod, now: number): boolean {
  if (p === "all") return true;
  const at = Date.parse(r.createdAt);
  if (Number.isNaN(at)) return false;
  const d = new Date(now);
  return at >= (p === "today" ? new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() : now - 7 * DAY);
}

const sorters: Record<ProSort, (a: UrgentRequest, b: UrgentRequest) => number> = {
  attention: (a, b) => rank(a) - rank(b) || (live(a) ? made(a) - made(b) : made(b) - made(a)),
  waiting: (a, b) => Number(live(b)) - Number(live(a)) || made(a) - made(b),
  new: (a, b) => made(b) - made(a),
  old: (a, b) => made(a) - made(b),
};

const base = (rows: UrgentRequest[], f: ProFilters, now: number) => rows.filter((r) => matches(r, f.q) && inPeriod(r, f.period, now));

// Search + status + period + sort. `now` is injectable for tests.
export function applyProFilters(rows: UrgentRequest[], f: ProFilters, now = Date.now()): UrgentRequest[] {
  return base(rows, f, now).filter((r) => !f.status || (r.status || "open_pool") === f.status).sort(sorters[f.sort]);
}

// Live counts for the status chips: what search and period leave, per status ("" = all of them).
export function statusCounts(rows: UrgentRequest[], f: ProFilters, now = Date.now()): Record<string, number> {
  const out: Record<string, number> = { "": 0 };
  for (const r of base(rows, f, now)) {
    const s = r.status || "open_pool";
    out[s] = (out[s] ?? 0) + 1;
    out[""] += 1;
  }
  return out;
}

// The non-default choices that are on (the badge on the filter button); the search text is not counted.
export const activeProCount = (f: ProFilters): number => (f.status ? 1 : 0) + (f.period !== "all" ? 1 : 0) + (f.sort !== "attention" ? 1 : 0);
