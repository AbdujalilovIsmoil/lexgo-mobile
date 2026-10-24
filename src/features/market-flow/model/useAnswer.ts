import { useState } from "react";
import { codeOf } from "@/entities/market-flow";
import { acceptOrder, declineOrder } from "@/entities/pro-order/api/orderApi";
import { ApiError, isForbidden } from "@/shared/api";
import { useFlowMutation } from "./useFlowMutation";

export type AnswerOutcome = "" | "accepted" | "declined" | "expired" | "taken" | "forbidden";

// The seller's answer to an assignment (TZ §5): accept or decline before the backend deadline. An expired window, an order someone else
// took (409) or a refusal (403) end in a neutral state on the card itself; the order is re-read either way.
export function useAnswer(orderId: string) {
  const [outcome, setOutcome] = useState<AnswerOutcome>("");
  const settle = (e: unknown): boolean => {
    const code = codeOf(e);
    const next: AnswerOutcome = code === "assignment_response_deadline_expired" || code === "assignment_not_accepting" ? "expired" : isForbidden(e) ? "forbidden" : e instanceof ApiError && e.status === 409 ? "taken" : "";
    if (next) setOutcome(next);
    return !!next;
  };
  const accept = useFlowMutation({ mutationFn: () => acceptOrder(orderId), success: "mf.asg.accepted", onSuccess: () => setOutcome("accepted"), onError: settle });
  const decline = useFlowMutation({ mutationFn: (v: { reason: string; note: string }) => declineOrder(orderId, v.reason, v.note), success: "mf.asg.declined", onSuccess: () => setOutcome("declined"), onError: settle });
  return { outcome, accept, decline, busy: accept.isPending || decline.isPending };
}
