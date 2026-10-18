import { stageOf } from "./stage";
import type { ProOrder } from "../model/types";
import { isPaused } from "./additional";

// Mirror of the backend ORDER_TRANSITIONS rows that matter after payment, narrowed to the moves a
// seller may make (law-main lib/orderStatus.ts). The server still has the last word (409).
const NEXT: Record<string, string[]> = {
  paid: ["started", "in_progress"],
  accepted: ["started", "in_progress", "result_ready"],
  started: ["in_progress", "result_ready"],
  in_progress: ["result_ready", "delivered"],
  result_ready: ["delivered"],
  quality_check: ["delivered", "in_progress"],
};

export type OrderActions = { accept: boolean; decline: boolean; moves: string[]; complete: boolean; chat: boolean; extra: boolean; paused: boolean };

export function actionsOf(o: ProOrder, acceptAllowed = true): OrderActions {
  const stage = stageOf(o);
  const open = stage === "new" || stage === "active";
  const paused = isPaused(o);
  return {
    accept: acceptAllowed && (o.status === "sent_to_seller" || o.status === "paid"),
    decline: acceptAllowed && o.status === "sent_to_seller",
    moves: open && acceptAllowed && !paused ? (NEXT[o.status] ?? []) : [],
    complete: acceptAllowed && stage === "active" && !paused && o.canComplete,
    extra: acceptAllowed && !paused && (stage === "active" || stage === "new") && !!(o.serviceId || o.packageId),
    paused,
    chat: o.canChat && (open || stage === "completed"),
  };
}

// The five steps of the track under an order (request → paid → work → delivered → done).
export const TRACK = ["paid", "accepted", "in_progress", "delivered", "completed"] as const;
const RANK: Record<string, number> = { paid: 0, sent_to_seller: 0, accepted: 1, started: 2, in_progress: 2, result_ready: 3, quality_check: 3, delivered: 3, client_confirmation: 3, completed: 4, rated: 4 };
export const trackIndex = (status: string): number => RANK[status] ?? 0;
