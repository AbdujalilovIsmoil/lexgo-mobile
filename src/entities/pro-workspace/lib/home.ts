import type { CabinetCase } from "../model/types";

export type TaskTab = "today" | "upcoming" | "done";
export const TASK_TABS: TaskTab[] = ["today", "upcoming", "done"];
const isDoneCase = (c: Pick<CabinetCase, "status">): boolean => c.status === "completed" || c.status === "archived";

// "My tasks" are the active cases: due today, still ahead (or undated), or finished — grouped like the web dashboard.
export function groupTasks(cases: CabinetCase[], today: string): Record<TaskTab, CabinetCase[]> {
  const isToday = (c: CabinetCase) => !!c.deadlineAt && c.deadlineAt.slice(0, 10) === today;
  return { today: cases.filter((c) => isToday(c) && !isDoneCase(c)), upcoming: cases.filter((c) => !isToday(c) && !isDoneCase(c)), done: cases.filter(isDoneCase) };
}

// The profile checklist: a step is on once the completeness reaches its threshold (1 / 25 / 50 / 75 / 100).
export const CHECKLIST = [{ key: "checkBasics", at: 1 }, { key: "checkId", at: 25 }, { key: "checkDocs", at: 50 }, { key: "checkServices", at: 75 }, { key: "checkPricing", at: 100 }] as const;

// Profile completeness from what the backend really holds (the web only guesses 60 / 100 at login): the lawyer's eight checks or the
// advocate's nine, as the web's scoreCompleteness lists them. Fields are read tolerantly from GET /lawyers/me/cabinet's `profile`.
export function profileScore(p: Record<string, unknown>, advocate: boolean): number {
  const has = (...k: string[]) => k.some((x) => { const v = p[x]; return Array.isArray(v) ? v.length > 0 : typeof v === "number" ? v > 0 : typeof v === "string" ? !!v.trim() : !!v; });
  const checks = advocate
    ? [has("lawyer_name", "name"), has("avatar_url", "photo_url", "photo", "image_url"), has("email"), has("region"), has("license_number"), has("specializations", "specialization"), has("experience_years", "lawyer_experience_years", "advocate_experience_years"), has("practice_areas", "specializations"), has("wins_count", "partial_wins_count", "total_cases")]
    : [has("lawyer_name", "name"), has("avatar_url", "photo_url", "photo", "image_url"), has("region"), has("languages"), has("education"), has("experience_years", "lawyer_experience_years"), has("bio"), has("services")];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

// Whole percent of the onboarding steps done (0 when there are none).
export const completeness = (done: number, total: number): number => (total > 0 ? Math.min(100, Math.round((done / total) * 100)) : 0);

// Monday-first grid of a month: leading blanks (null), then 1..N, padded to whole weeks.
export function monthGrid(year: number, month: number): (number | null)[] {
  const lead = (new Date(year, month, 1).getDay() + 6) % 7;
  const cells: (number | null)[] = [...Array<null>(lead).fill(null), ...Array.from({ length: new Date(year, month + 1, 0).getDate() }, (_, i) => i + 1)];
  while (cells.length % 7) cells.push(null);
  return cells;
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
