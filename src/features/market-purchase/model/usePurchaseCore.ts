import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { activePurchaseOf, marketKeys, useMarketOrder, useMarketSync, type MarketPurchase, type PreferredChannel } from "@/entities/order";
import { useQuote, type PriceOptions, type Quote } from "@/entities/price-option";
import { ApiError } from "@/shared/api";
import { errorHaptic, successHaptic } from "@/shared/lib/haptics";
import { useAppForm } from "@/shared/form";
import { useErrorText } from "@/shared/ui";
import { purchaseSchema } from "./purchaseSchema";
import { phaseOfOrder, phaseOfStatus, type PurchasePhase } from "./phase";

export type Tracked = { orderId: string; workId: string; status: string; amount: number; existing: boolean; telegramSent: boolean };
type Send = (v: { note: string; time: string; channel: PreferredChannel; optionIds: string[] }) => Promise<MarketPurchase>;
type Opts = { options: { data?: PriceOptions }; quote: (ids: string[]) => Promise<Quote>; send: Send; onLogin: () => void };

// The purchase request shared by a service and a package: options → backend quote → purchase-request with exactly the quoted
// option ids → follow the order. The Telegram approval arrives through the user socket (useMarketSync), nothing polls.
export function usePurchaseCore({ options, quote, send, onLogin }: Opts) {
  const qc = useQueryClient();
  const errText = useErrorText();
  const f = useAppForm(purchaseSchema, { note: "", time: "" });
  const q = useQuote(quote, true);
  const [channel, setChannel] = useState<PreferredChannel>("chat");
  const [tracked, setTracked] = useState<Tracked | null>(null);
  const [error, setError] = useState("");
  const track = (r: Pick<MarketPurchase, "orderId" | "workId" | "status" | "amount">, existing: boolean, telegramSent = true) => setTracked({ ...r, existing, telegramSent });

  const go = useMutation({
    mutationFn: (v: { note: string; time: string }) => send({ ...v, channel, optionIds: q.quote?.selectedIds ?? q.ids }),
    onSuccess: (r) => { successHaptic(); track(r, false, r.telegramSent); void qc.invalidateQueries({ queryKey: marketKeys.list }); },
    onError: (e) => {
      errorHaptic();
      const active = activePurchaseOf(e);
      if (active) return track({ ...active, amount: 0 }, true);
      if (e instanceof ApiError && e.status === 401) return onLogin();
      setError(errText(e));
    },
  });

  const key = tracked ? tracked.orderId || tracked.workId : "";
  useMarketSync();
  const order = useMarketOrder(key, !!tracked);
  const found = order.data ?? null;
  const phase: PurchasePhase | null = tracked ? (found ? phaseOfOrder(found) : phaseOfStatus(tracked.status)) : null;
  const submit = f.handleSubmit((v) => { setError(""); go.mutate(v); });
  return { form: f, options, q, channel, setChannel, tracked, found, phase, error, sending: go.isPending, submit, reset: () => { setTracked(null); setError(""); }, check: () => order.refetch(), checking: order.isFetching };
}
