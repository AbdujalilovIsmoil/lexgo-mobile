import type { Order } from "@/entities/order";

export type Job = Order & { deadlineAt: string };
export type Sort = "new" | "old" | "budgetDesc" | "budgetAsc" | "deadline";
export type Budget = "any" | "low" | "mid" | "high";
export type When = "all" | "today" | "week";
export type Filters = { q: string; region: string; budget: Budget; when: When; sort: Sort };

export const SORTS: Sort[] = ["new", "old", "budgetDesc", "budgetAsc", "deadline"];
export const BUDGETS: Budget[] = ["any", "low", "mid", "high"];
export const WHENS: When[] = ["all", "today", "week"];
export const NO_FILTERS: Filters = { q: "", region: "", budget: "any", when: "all", sort: "new" };
// Budget bands in so'm: under 300 000 · 300 000 – 1 000 000 · from 1 000 000.
export const LOW_MAX = 300_000;
export const MID_MAX = 1_000_000;
const DAY = 86_400_000;

const inBudget = (amount: number | undefined, b: Budget): boolean => {
  if (b === "any") return true;
  if (!amount) return false; // an unknown budget belongs to no band
  const v = amount;
  return b === "low" ? v < LOW_MAX : b === "mid" ? v >= LOW_MAX && v < MID_MAX : v >= MID_MAX;
};
const inWhen = (createdAt: string, w: When, now: number): boolean => {
  if (w === "all") return true;
  const at = Date.parse(createdAt);
  if (Number.isNaN(at)) return false;
  const d = new Date(now);
  const start = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  return w === "today" ? at >= start : at >= now - 7 * DAY;
};
const when = (s: string): number => (s ? Date.parse(s) : NaN);

// How many of the non-default choices are on (the badge on the filter button); the search text is not counted.
export const activeCount = (f: Filters): number => (f.region ? 1 : 0) + (f.budget !== "any" ? 1 : 0) + (f.when !== "all" ? 1 : 0) + (f.sort !== "new" ? 1 : 0);

// Search + filters + sort of the open-orders feed. `now` is injectable for tests.
export function applyFilters(rows: Job[], f: Filters, now = Date.now()): Job[] {
  const needle = f.q.trim().toLowerCase();
  const kept = rows.filter((j) => (!needle || `${j.serviceName} ${j.title} ${j.region} ${j.workId}`.toLowerCase().includes(needle)) && (!f.region || j.region === f.region) && inBudget(j.amount, f.budget) && inWhen(j.createdAt, f.when, now));
  const byNew = (a: Job, b: Job) => b.createdAt.localeCompare(a.createdAt);
  const cmp: Record<Sort, (a: Job, b: Job) => number> = {
    new: byNew,
    old: (a, b) => a.createdAt.localeCompare(b.createdAt),
    budgetDesc: (a, b) => (b.amount ?? 0) - (a.amount ?? 0) || byNew(a, b),
    budgetAsc: (a, b) => (a.amount ?? 0) - (b.amount ?? 0) || byNew(a, b),
    deadline: (a, b) => (Number.isNaN(when(a.deadlineAt)) ? Infinity : when(a.deadlineAt)) - (Number.isNaN(when(b.deadlineAt)) ? Infinity : when(b.deadlineAt)) || byNew(a, b),
  };
  return [...kept].sort(cmp[f.sort]);
}

// Regions present in the feed with how many jobs each has, biggest first.
export function regionsOf(rows: Job[]): { name: string; count: number }[] {
  const m = new Map<string, number>();
  for (const j of rows) if (j.region) m.set(j.region, (m.get(j.region) ?? 0) + 1);
  return [...m].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}
