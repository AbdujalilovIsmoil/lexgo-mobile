import type { ProOrder, StageTab } from "../model/types";
import { stageOf } from "./stage";

export type OrderSort = "new" | "old" | "priceDesc" | "priceAsc";
export type OrderWhen = "all" | "today" | "week" | "month";
export type OrderPrice = "any" | "low" | "mid" | "high";
export type OrderFilters = { q: string; stage: StageTab; when: OrderWhen; price: OrderPrice; sort: OrderSort };

export const ORDER_SORTS: OrderSort[] = ["new", "old", "priceDesc", "priceAsc"];
export const ORDER_WHENS: OrderWhen[] = ["all", "today", "week", "month"];
export const ORDER_PRICES: OrderPrice[] = ["any", "low", "mid", "high"];
export const NO_ORDER_FILTERS: OrderFilters = { q: "", stage: "all", when: "all", price: "any", sort: "new" };
// Price bands in so'm: under 300 000 · 300 000 – 1 000 000 · from 1 000 000.
export const LOW_MAX = 300_000;
export const MID_MAX = 1_000_000;
const DAY = 86_400_000;

const inPrice = (v: number, b: OrderPrice): boolean => b === "any" || (b === "low" ? v < LOW_MAX : b === "mid" ? v >= LOW_MAX && v < MID_MAX : v >= MID_MAX);
const inWhen = (createdAt: string, w: OrderWhen, now: number): boolean => {
  if (w === "all") return true;
  const at = Date.parse(createdAt);
  if (Number.isNaN(at)) return false;
  const d = new Date(now);
  const start = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  return w === "today" ? at >= start : at >= now - (w === "week" ? 7 : 30) * DAY;
};

// How many non-default choices are on (the badge on the filter button); the search text is not counted.
export const orderActiveCount = (f: OrderFilters): number => (f.stage !== "all" ? 1 : 0) + (f.when !== "all" ? 1 : 0) + (f.price !== "any" ? 1 : 0) + (f.sort !== "new" ? 1 : 0);

// Search (service, work id, client) + stage + period + price band + sort. `now` is injectable for tests.
export function applyOrderFilters(rows: ProOrder[], f: OrderFilters, now = Date.now()): ProOrder[] {
  const needle = f.q.trim().toLowerCase();
  const kept = rows.filter((o) => (!needle || `${o.serviceTitle} ${o.workId} ${o.buyerName}`.toLowerCase().includes(needle)) && (f.stage === "all" || stageOf(o) === f.stage) && inPrice(o.price, f.price) && inWhen(o.createdAt, f.when, now));
  const byNew = (a: ProOrder, b: ProOrder) => b.createdAt.localeCompare(a.createdAt);
  const cmp: Record<OrderSort, (a: ProOrder, b: ProOrder) => number> = {
    new: byNew,
    old: (a, b) => a.createdAt.localeCompare(b.createdAt),
    priceDesc: (a, b) => b.price - a.price || byNew(a, b),
    priceAsc: (a, b) => a.price - b.price || byNew(a, b),
  };
  return [...kept].sort(cmp[f.sort]);
}
