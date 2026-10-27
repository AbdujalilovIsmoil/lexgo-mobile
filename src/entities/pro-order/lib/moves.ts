import { stageOf } from "./stage";
import type { ProOrder } from "../model/types";
import { isPaused } from "./additional";

export type OrderActions = { accept: boolean; decline: boolean; start: boolean; review: boolean; complete: boolean; cancelRequest: boolean; chat: boolean; extra: boolean; paused: boolean };

// What the seller may do now, from the backend's flags (TZ §4.2: never from the status alone). An assignment with a backend answer
// deadline (TZ §5) is answered on its own card. The work starts with the order's start action (TZ §6); during the review stage the main
// action sets the delivery time (TZ §7) and completion waits for it. The old hand-made status moves (result ready, delivered …) are gone:
// a marketplace order is finished through completion, which checks the checklist.
export function actionsOf(o: ProOrder, acceptAllowed = true): OrderActions {
  const stage = stageOf(o);
  const open = stage === "new" || stage === "active";
  const paused = isPaused(o);
  const assignment = !!o.flow?.acceptanceDeadlineAt;
  // Accepted but the client's advance is not confirmed yet (contact still locked): nothing to start (TZ §6).
  const waitingAdvance = o.flow?.contactUnlocked === false;
  const reviewing = o.flow?.workPhase === "reviewing";
  return {
    accept: acceptAllowed && !assignment && (o.status === "sent_to_seller" || o.status === "paid"),
    decline: acceptAllowed && !assignment && o.status === "sent_to_seller",
    start: acceptAllowed && !paused && open && !waitingAdvance && !!o.flow?.canStart,
    review: acceptAllowed && !paused && open && reviewing,
    // The backend's can_complete decides when it is sent; complete_url alone only when the flag is missing (normFlow).
    complete: acceptAllowed && stage === "active" && !paused && !reviewing && (o.flow ? o.flow.canComplete : o.canComplete),
    cancelRequest: acceptAllowed && !!o.flow?.canRequestCancellation,
    extra: acceptAllowed && !paused && (stage === "active" || stage === "new") && !!(o.serviceId || o.packageId),
    paused,
    chat: o.canChat && (open || stage === "completed"),
  };
}

// The five steps of the track under an order (request → paid → work → delivered → done).
export const TRACK = ["paid", "accepted", "in_progress", "delivered", "completed"] as const;
// TZ §6: the final payment never takes a finished order back — whatever status follows "completed" stays on the last step.
const RANK: Record<string, number> = { paid: 0, sent_to_seller: 0, accepted: 1, started: 2, in_progress: 2, result_ready: 3, quality_check: 3, delivered: 3, client_confirmation: 3, completed: 4, rated: 4, done: 4, closed: 4, final_paid: 4 };
export const trackIndex = (status: string): number => RANK[status] ?? 0;
