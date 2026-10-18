import type { OnbState, OnbStep } from "../model/types";

// Pure rules of the onboarding journey: step states, submit readiness, hero kind, document status.

export type StepStatus = "done" | "current" | "todo" | "optional";

const requiredOpen = (s: OnbStep) => s.required && !s.completed;

// done = completed; current = the first open required step (where to go next); todo = other open required steps;
// optional = open steps that do not block the submit.
export function stepStates(steps: OnbStep[]): StepStatus[] {
  const cur = steps.findIndex(requiredOpen);
  return steps.map((s, i) => (s.completed ? "done" : i === cur ? "current" : s.required ? "todo" : "optional"));
}

export const nextStep = (steps: OnbStep[]): OnbStep | undefined => steps.find(requiredOpen);
export const missingRequired = (steps: OnbStep[]): number => steps.filter(requiredOpen).length;

export type Readiness = { mode: "hidden" | "waiting" | "blocked" | "ready"; canSubmit: boolean; missing: number };

// hidden once approved, waiting while the review runs, blocked until every required step is done.
export function submitReadiness(state: OnbState, steps: OnbStep[]): Readiness {
  const missing = missingRequired(steps);
  if (state === "approved") return { mode: "hidden", canSubmit: false, missing };
  if (state === "submitted") return { mode: "waiting", canSubmit: false, missing };
  const ok = steps.length > 0 && missing === 0;
  return { mode: ok ? "ready" : "blocked", canSubmit: ok, missing };
}

export type HeroKind = "fresh" | "progress" | "ready" | "submitted" | "approved" | "rejected";

export function heroKind(state: OnbState, done: number): HeroKind {
  if (state === "incomplete") return done > 0 ? "progress" : "fresh";
  return state;
}

// Where a step's action leads: the documents sheet, a screen, or nowhere.
const ROUTES: Record<string, string> = { profile: "/pro/profile", identity: "/security", services: "/pro/services", pricing: "/pro/services" };
export type StepTarget = { kind: "docs" } | { kind: "route"; path: string } | null;
export function stepTarget(key: string): StepTarget {
  if (key === "documents") return { kind: "docs" };
  return ROUTES[key] ? { kind: "route", path: ROUTES[key] } : null;
}

export type DocStatus = "uploaded" | "review" | "approved" | "rejected";

export function docStatus(raw: string): DocStatus {
  const s = raw.toLowerCase();
  if (/^(rejected|declined|denied|failed|invalid)$/.test(s)) return "rejected";
  if (/^(approved|verified|accepted|confirmed)$/.test(s)) return "approved";
  if (/^(pending|in_review|under_review|review|reviewing|pending_review|submitted|moderation)$/.test(s)) return "review";
  return "uploaded";
}
