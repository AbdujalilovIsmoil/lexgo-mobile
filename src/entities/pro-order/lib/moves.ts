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

export type OrderActions = { accept: boolean; decline: boolean; start: boolean; moves: string[]; complete: boolean; chat: boolean; extra: boolean; paused: boolean };

// An assignment with a backend answer deadline (TZ.md §5) is answered on its own card (countdown, expiry), not from this bar. When the
// backend offers `start_url` the work is started with it (TZ §9) and the plain "started / in progress" moves are not offered next to it.
export function actionsOf(o: ProOrder, acceptAllowed = true): OrderActions {
  const stage = stageOf(o);
  const open = stage === "new" || stage === "active";
  const paused = isPaused(o);
  const assignment = !!o.flow?.acceptanceDeadlineAt;
  // Accepted but the client's advance is not confirmed yet (contact still locked): nothing to start or move (TZ §6).
  const waitingAdvance = o.flow?.contactUnlocked === false;
  const start = acceptAllowed && !paused && open && !waitingAdvance && !!o.flow?.canStart;
  const moves = open && acceptAllowed && !paused && !waitingAdvance ? (NEXT[o.status] ?? []) : [];
  return {
    accept: acceptAllowed && !assignment && (o.status === "sent_to_seller" || o.status === "paid"),
    decline: acceptAllowed && !assignment && o.status === "sent_to_seller",
    start,
    moves: start ? moves.filter((m) => m !== "started" && m !== "in_progress") : moves,
    // The backend's can_complete decides when it is sent; complete_url alone only when the flag is missing (normFlow).
    complete: acceptAllowed && stage === "active" && !paused && (o.flow ? o.flow.canComplete : o.canComplete),
    extra: acceptAllowed && !paused && (stage === "active" || stage === "new") && !!(o.serviceId || o.packageId),
    paused,
    chat: o.canChat && (open || stage === "completed"),
  };
}

// The five steps of the track under an order (request → paid → work → delivered → done).
export const TRACK = ["paid", "accepted", "in_progress", "delivered", "completed"] as const;
const RANK: Record<string, number> = { paid: 0, sent_to_seller: 0, accepted: 1, started: 2, in_progress: 2, result_ready: 3, quality_check: 3, delivered: 3, client_confirmation: 3, completed: 4, rated: 4 };
export const trackIndex = (status: string): number => RANK[status] ?? 0;
