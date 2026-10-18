import { marketStageOf } from "./stage";
import type { MarketOrder, StatusEntry } from "../model/marketTypes";

export type TimelineItem = { key: string; label: string; at: string; note?: string; state: "done" | "now" | "fail" };

// What happened to a purchase, oldest first. GET /orders/{id}/status-history is
// empty for marketplace purchases (they do not go through PATCH …/status), so the
// steps are read from the order itself: request, payment approval, work, result.
// When the backend does send history rows, those are shown as they are.
type Words = { status: (s: string) => string; step: (k: string) => string };

export function buildTimeline(o: MarketOrder, history: StatusEntry[], w: Words): TimelineItem[] {
  if (history.length) {
    return [...history].reverse().map((h, i, all) => ({ key: `${h.at}-${i}`, label: w.status(h.status), at: h.at, note: h.note || undefined, state: i === all.length - 1 && marketStageOf(o) === "active" ? "now" : "done" }));
  }
  const stage = marketStageOf(o);
  const out: TimelineItem[] = [{ key: "request", label: w.step("request"), at: o.requestedAt, state: "done" }];
  if (stage === "pending") return [...out, { key: "wait", label: w.step("waitPay"), at: "", state: "now" }];
  if (stage === "cancelled") return [...out, ...(o.paymentStatus === "paid" ? [{ key: "paid", label: w.step("paid"), at: o.paidAt, state: "done" as const }] : []), { key: "cancelled", label: w.step("cancelled"), at: o.updatedAt, state: "fail" }];
  out.push({ key: "paid", label: w.step(o.canStartChat ? "paidChat" : "paid"), at: o.paidAt || o.updatedAt, state: "done" });
  out.push(stage === "completed" ? { key: "done", label: w.step("completed"), at: o.updatedAt, state: "done" } : { key: "work", label: w.step("working"), at: "", state: "now" });
  return out;
}
