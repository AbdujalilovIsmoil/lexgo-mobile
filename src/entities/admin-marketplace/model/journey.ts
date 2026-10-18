import type { MktConfirm } from "./detailTypes";
import type { MktOrder } from "./types";

export type StepState = "done" | "now" | "fail" | "todo";
export type JourneyStep = { key: string; state: StepState; label: string; at: string };

// The order's path: request → Telegram confirmation → work → done/cancelled, derived from order + confirm status.
export function journeyOf(o: MktOrder, c: MktConfirm | undefined): JourneyStep[] {
  const cancelled = o.status === "cancelled";
  const completed = o.status === "completed";
  const paid = o.paymentStatus === "paid" || o.status === "paid" || completed;
  const rejected = c?.status === "rejected";
  const approved = c?.status === "approved" || paid;
  const at = c?.reviewedAt || o.payment?.updatedAt || "";
  const confirm: JourneyStep = approved
    ? { key: "confirm", state: "done", label: "confirm", at }
    : rejected
      ? { key: "confirm", state: "fail", label: "rejected", at: c?.reviewedAt || "" }
      : { key: "confirm", state: cancelled ? "todo" : "now", label: "confirm", at: "" };
  const work: JourneyStep = completed
    ? { key: "work", state: "done", label: "work", at }
    : paid && !cancelled
      ? { key: "work", state: "now", label: "work", at }
      : { key: "work", state: cancelled && approved ? "fail" : "todo", label: "work", at: "" };
  const end: JourneyStep = completed
    ? { key: "end", state: "done", label: "done", at: o.updatedAt }
    : cancelled
      ? { key: "end", state: "fail", label: "cancelled", at: o.updatedAt }
      : { key: "end", state: "todo", label: "finish", at: "" };
  return [{ key: "requested", state: "done", label: "requested", at: o.requestedAt || o.createdAt }, confirm, work, end];
}
