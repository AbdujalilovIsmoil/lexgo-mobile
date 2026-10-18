import type { Dict } from "@/shared/lib/json";
import { asNum } from "@/shared/lib/json";

export const DASH = "—";

// A counter exists only when the backend sent a number for it (missing is "unknown", not 0).
export const has = (d: Dict | undefined, k: string): boolean => {
  const v = d?.[k];
  if (v == null || v === "") return false;
  return Number.isFinite(typeof v === "string" ? Number(v) : v);
};

export const val = (d: Dict | undefined, k: string): number | undefined => (has(d, k) ? asNum(d?.[k]) : undefined);

export const fmtCount = (v: number | undefined): string => (v == null ? DASH : String(Math.round(v)));

// Whole percent from a 0..1 or 0..100 rate; undefined stays unknown.
export const ratePct = (v: number | undefined): number | undefined => (v == null ? undefined : Math.max(0, Math.min(100, Math.round(v <= 1 ? v * 100 : v))));

export const fmtPct = (v: number | undefined): string => {
  const p = ratePct(v);
  return p == null ? DASH : `${p}%`;
};

// Change between two values in %, null when there is nothing to compare against.
export function deltaPct(cur: number, prev: number): number | null {
  if (!Number.isFinite(cur) || !Number.isFinite(prev) || prev <= 0) return null;
  return Math.round(((cur - prev) / prev) * 1000) / 10;
}

export type Trend = "up" | "down" | "flat";
export const trendOf = (d: number | null): Trend | null => (d == null ? null : d > 0.05 ? "up" : d < -0.05 ? "down" : "flat");

// Bar heights 0..1 for a sparkline (at least `floor` so a zero still shows a stub).
export function sparkHeights(values: number[], floor = 0.08): number[] {
  const max = Math.max(0, ...values);
  return values.map((v) => (max <= 0 ? floor : Math.max(floor, Math.min(1, v / max))));
}

// Shares of a stacked bar: fractions that sum to 1 (empty when the total is 0).
export function shares(values: number[]): number[] {
  const total = values.reduce((a, b) => a + Math.max(0, b), 0);
  return total <= 0 ? values.map(() => 0) : values.map((v) => Math.max(0, v) / total);
}

// Response time as a bar: 1 at or under the target, shrinking as it gets slower; undefined when unknown or 0.
export function speedFill(avgMinutes: number | undefined, target = 15): number | undefined {
  if (avgMinutes == null || avgMinutes <= 0) return undefined;
  return Math.min(1, target / avgMinutes);
}

// Star fill per position (0, 0.5 or 1) for a rating out of 5.
export const starFills = (rating: number): number[] =>
  [0, 1, 2, 3, 4].map((i) => {
    const d = Math.max(0, Math.min(5, rating)) - i;
    return d >= 0.75 ? 1 : d >= 0.25 ? 0.5 : 0;
  });

export type Pay = { amount: number; status: string };
const PAID = ["paid", "released", "completed", "done"];
export const isPaid = (status: string): boolean => PAID.includes(status);
export const sumPayouts = (rows: Pay[], paid: boolean): number => rows.filter((p) => isPaid(p.status) === paid).reduce((a, p) => a + p.amount, 0);

// Nothing to show yet: no counters, no earnings, no cases, no payouts.
export function isNewSeller(args: { workload: Dict; finance: Dict; performance: Dict; payouts: number; cases: number; totalCases: number }): boolean {
  const any = (d: Dict) => Object.keys(d).some((k) => has(d, k) && asNum(d[k]) !== 0);
  return !any(args.workload) && !any(args.finance) && !any(args.performance) && args.payouts === 0 && args.cases === 0 && args.totalCases === 0;
}
