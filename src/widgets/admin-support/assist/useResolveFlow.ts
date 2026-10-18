import { useState } from "react";
import { useResolveAddPay, type AssistOrder, type ResolveInput } from "@/entities/admin-support";
import { toast } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { useAssistError } from "./useAssistError";

// Sends the operator's resolution. A refund is only STARTED: the screen then shows "waiting for Telegram approval".
export function useResolveFlow(ticketId: string, order: AssistOrder | null, done: () => void, onBlock: (e: unknown) => boolean, onRefund: (o: AssistOrder) => void) {
  const { t } = useT();
  const errText = useAssistError();
  const [err, setErr] = useState("");
  const m = useResolveAddPay(ticketId);
  const run = (input: ResolveInput) => {
    if (!order?.addPay) return;
    setErr("");
    m.mutate({ requestId: order.addPay.requestId, input }, {
      onSuccess: () => {
        if (input.action !== "replace_options") onRefund(order);
        toast(t(input.action === "replace_options" ? "ntd.ccV2.pay.replaced" : "ntd.ccV2.pay.refund.waiting"), "ok");
        done();
      },
      onError: (e) => (onBlock(e) ? done() : setErr(errText(e))),
    });
  };
  return { run, err, busy: m.isPending, reset: () => setErr("") };
}
