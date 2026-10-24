import type { OrderComplaint } from "../model/types";

// Milliseconds until an ISO deadline (0 when missing or passed). The backend's deadline is the authority; the phone only counts down.
export function msUntil(iso: string, now: number): number {
  const end = Date.parse(iso);
  return Number.isFinite(end) ? Math.max(0, end - now) : 0;
}

// The complaint action (TZ §10): open while the backend says available and its deadline has not passed, never twice.
export type ComplaintState = "open" | "submitted" | "closed" | "none";
export function complaintState(c: OrderComplaint, now: number): ComplaintState {
  if (c.submitted) return "submitted";
  if (!c.available) return c.deadlineAt ? "closed" : "none";
  if (c.deadlineAt && msUntil(c.deadlineAt, now) === 0) return "closed";
  return "open";
}

// The seller's answer window of an assignment (TZ §5): open until the absolute backend deadline, then expired.
export type AnswerState = "open" | "expired" | "none";
export function answerState(deadlineAt: string, now: number): AnswerState {
  if (!deadlineAt) return "none";
  return msUntil(deadlineAt, now) > 0 ? "open" : "expired";
}

// "23:59:07" / "04:12" — hours only when there are any.
export function clock(ms: number): string {
  const s = Math.ceil(Math.max(0, ms) / 1000);
  const p = (n: number) => String(n).padStart(2, "0");
  const h = Math.floor(s / 3600);
  return h ? `${p(h)}:${p(Math.floor((s % 3600) / 60))}:${p(s % 60)}` : `${p(Math.floor(s / 60))}:${p(s % 60)}`;
}
