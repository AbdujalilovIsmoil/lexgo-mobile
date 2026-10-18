import { useCallback } from "react";
import { useOrderOptions } from "./useOrderOptions";
import { quotePackage, quoteService, useQuote } from "@/entities/price-option";
import { useRequestAdditional, type ProOrder } from "@/entities/pro-order";
import { useSession } from "@/entities/session";
import { useAppForm } from "@/shared/form";
import { useSheetReset } from "@/shared/lib/useSheetReset";
import { additionalSchema } from "./schema";

// Studio options of the order's service / package + the backend quote of the chosen set. The chosen set starts as what the
// client already bought (the new total must exceed what was paid); nothing is computed on the phone.
export function useAdditional(order: ProOrder, visible: boolean, onClose: () => void) {
  const me = useSession()?.user.id ?? "";
  const opts = useOrderOptions(order, visible);
  const load = useCallback((ids: string[]) => (order.packageId ? quotePackage(order.packageId, ids) : quoteService(order.serviceId, me, ids)), [order.packageId, order.serviceId, me]);
  const q = useQuote(load, visible && !!opts.data?.sections.length);
  const form = useAppForm(additionalSchema, { note: "" });
  useSheetReset(visible, () => { form.reset({ note: "" }); q.set(order.optionIds); });
  const send = useRequestAdditional(onClose);
  const submit = form.handleSubmit((v) => send.mutate({ id: order.id, optionIds: q.ids, note: v.note }));
  return { opts, q, form, submit, sending: send.isPending, canSend: q.ids.length > 0 && !q.pending };
}
