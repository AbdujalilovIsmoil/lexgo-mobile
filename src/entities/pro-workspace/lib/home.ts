import type { CabinetCase } from "../model/types";

export type TaskTab = "today" | "upcoming" | "done";
export const TASK_TABS: TaskTab[] = ["today", "upcoming", "done"];
const isDoneCase = (c: Pick<CabinetCase, "status">): boolean => c.status === "completed" || c.status === "archived";

// "My tasks" are the active cases: due today, still ahead (or undated), or finished — grouped like the web dashboard.
export function groupTasks(cases: CabinetCase[], today: string): Record<TaskTab, CabinetCase[]> {
  const isToday = (c: CabinetCase) => !!c.deadlineAt && c.deadlineAt.slice(0, 10) === today;
  return { today: cases.filter((c) => isToday(c) && !isDoneCase(c)), upcoming: cases.filter((c) => !isToday(c) && !isDoneCase(c)), done: cases.filter(isDoneCase) };
}

// Referral ladder for sellers (S-28): active referred sellers → commission %. Base 18 %, floor 12 %.
const TIERS: [number, number][] = [[5, 16], [10, 15], [20, 13]];
const BASE = 18;
export function commissionLadder(joined: number): { now: number; goal: number; next: number | null } {
  const reached = TIERS.filter(([n]) => joined >= n);
  const next = TIERS.find(([n]) => joined < n);
  return { now: reached.length ? reached[reached.length - 1][1] : BASE, goal: next ? next[0] : TIERS[TIERS.length - 1][0], next: next ? next[1] : null };
}

// Rating from fewer than five reviews reads as unreliably precise: "new" instead of a number.
export const MIN_REVIEWS_FOR_RATING = 5;
