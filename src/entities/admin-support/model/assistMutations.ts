import { useMutation, useQueryClient } from "@tanstack/react-query";
import { checkoutPlan, previewPlan, requestDocument, requestMarket, requestUrgent } from "../api/assistApi";
import { resolveAddPay } from "../api/addPayApi";
import type { ResolveInput } from "../lib/resolveBody";
import { supKeys } from "./keys";

// Assist writes show their own errors inside the form, so these are plain mutations;
// a successful one refreshes the client context (pending requests, documents, orders).
function useAssist<V, R>(fn: (id: string, v: V) => Promise<R>, ticketId: string, refresh: boolean) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: V) => fn(ticketId, v),
    onSuccess: () => {
      if (refresh) void qc.invalidateQueries({ queryKey: supKeys.assist(ticketId) });
    },
  });
}

export const usePreviewPlan = (id: string) => useAssist(previewPlan, id, false);
export const useCheckoutPlan = (id: string) => useAssist(checkoutPlan, id, true);
export const useRequestDocument = (id: string) => useAssist(requestDocument, id, true);
export const useRequestMarket = (id: string) => useAssist(requestMarket, id, true);
export const useRequestUrgent = (id: string) => useAssist(requestUrgent, id, true);

// Resolve a supplemental payment: `requestId` rides with the input so one hook serves every request on the ticket.
export const useResolveAddPay = (id: string) => useAssist((tid: string, v: { requestId: string; input: ResolveInput }) => resolveAddPay(tid, v.requestId, v.input), id, true);
