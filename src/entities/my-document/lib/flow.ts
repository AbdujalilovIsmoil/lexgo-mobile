import type { DocRow } from "../model/types";
import { STOPPED } from "./status";

export type Step = "fill" | "pay" | "review" | "ready";
export type StepState = "done" | "now" | "todo" | "skip" | "fail";
export const STEPS: Step[] = ["fill", "pay", "review", "ready"];

const STEP_OF: Record<string, Step> = {
  questionnaire: "fill", draft: "fill", ready_to_generate: "fill",
  payment_pending: "pay", payment_required: "pay", awaiting_payment: "pay", pending_payment: "pay",
  lawyer_review_requested: "review", open_pool: "review", claimed: "review", lawyer_review: "review",
  file_ready: "ready", rated: "ready", closed: "ready",
};

type FlowInput = Pick<DocRow, "status" | "mode" | "lawyerActive" | "lawyer" | "paymentRequired" | "fileReady">;

// Where the request is on fill → pay → advocate review → ready; null when there is nothing to show.
export function flowOf(r: FlowInput): Record<Step, StepState> | null {
  const s = r.status.toLowerCase();
  const held = r.mode === "lawyer" || r.lawyerActive;
  const stopped = STOPPED.has(s);
  if (s === "closed" && !r.fileReady) return null;
  let cur: Step | undefined = stopped ? (s.startsWith("payment") ? "pay" : held ? "review" : "fill") : STEP_OF[s];
  if (!cur) cur = r.fileReady ? "ready" : held ? "review" : "fill";
  const needPay = r.paymentRequired || cur === "pay";
  const needReview = held || !!r.lawyer || cur === "review";
  const at = STEPS.indexOf(cur);
  const out = {} as Record<Step, StepState>;
  STEPS.forEach((st, i) => {
    const skip = (st === "pay" && !needPay) || (st === "review" && !needReview);
    out[st] = skip ? "skip" : cur === "ready" || i < at ? "done" : i === at ? (stopped ? "fail" : "now") : "todo";
  });
  return out;
}
