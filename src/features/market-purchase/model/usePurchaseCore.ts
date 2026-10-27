import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { activePurchaseOf, marketKeys, useMarketOrder, useMarketSync, type ContactSpeed, type MarketPurchase, type PaymentProvider, type PreferredChannel, type Urgency } from "@/entities/order";
import { useRuntimeCaps } from "@/entities/market-flow";
import { useQuote, type PriceOptions, type Quote } from "@/entities/price-option";
import { ApiError } from "@/shared/api";
import { errorHaptic, successHaptic } from "@/shared/lib/haptics";
import { useAppForm } from "@/shared/form";
import { useErrorText } from "@/shared/ui";
import { purchaseSchema } from "./purchaseSchema";
import { phaseOfOrder, phaseOfStatus, type PurchasePhase } from "./phase";

export type Tracked = { orderId: string; workId: string; status: string; amount: number; existing: boolean; telegramSent: boolean; paymentStatus: string; paymentUrl: string };
export type SendInput = { note: string; time: string; channel: PreferredChannel; optionIds: string[]; contactSpeed?: ContactSpeed; urgency?: Urgency; provider?: PaymentProvider };
type Send = (v: SendInput) => Promise<MarketPurchase>;
type Opts = { options: { data?: PriceOptions }; quote: (ids: string[]) => Promise<Quote>; send: Send; onLogin: () => void };

// An online provider that is switched off or failed (Enterprise contract §5): the request is offered once more through the Telegram approval.
const PROVIDER_FAILED = new Set(["payment_provider_not_configured", "payment_provider_unavailable", "payment_invoice_rejected", "marketplace_payment_provider_invalid"]);
const ONLINE: PaymentProvider[] = ["payme", "click"];

// The purchase request shared by a service and a package: options → backend quote → purchase-request with exactly the quoted
// option ids → follow the order. The full payment is approved before a seller gets the order (Enterprise contract §4); the approval
// arrives through the user socket (useMarketSync), nothing polls. Online providers are offered only while the platform enables them.
export function usePurchaseCore({ options, quote, send, onLogin }: Opts) {
  const qc = useQueryClient();
  const errText = useErrorText();
  const f = useAppForm(purchaseSchema, { note: "", time: "" });
  const q = useQuote(quote, true);
  const caps = useRuntimeCaps().data;
  const providers = caps?.providerEnabled ? ONLINE.filter((p) => caps.providers.includes(p)) : [];
  const [channel, setChannel] = useState<PreferredChannel>("chat");
  const [contactSpeed, setContactSpeed] = useState<ContactSpeed | undefined>(undefined);
  const [urgency, setUrgency] = useState<Urgency | undefined>(undefined);
  const [provider, setProvider] = useState<PaymentProvider>("telegram_manual");
  const [providerFailed, setProviderFailed] = useState(false);
  const [tracked, setTracked] = useState<Tracked | null>(null);
  const [error, setError] = useState("");
  const track = (r: Pick<MarketPurchase, "orderId" | "workId" | "status" | "amount"> & Partial<Pick<MarketPurchase, "paymentStatus" | "paymentUrl">>, existing: boolean, telegramSent = true) =>
    setTracked({ orderId: r.orderId, workId: r.workId, status: r.status, amount: r.amount, existing, telegramSent, paymentStatus: r.paymentStatus ?? "", paymentUrl: r.paymentUrl ?? "" });

  const go = useMutation({
    mutationFn: (v: { note: string; time: string; via?: PaymentProvider }) => {
      const via = v.via ?? provider;
      return send({ note: v.note, time: v.time, channel, contactSpeed, urgency, optionIds: q.quote?.selectedIds ?? q.ids, provider: via === "telegram_manual" ? undefined : via });
    },
    onSuccess: (r) => { successHaptic(); setProviderFailed(false); track(r, false, r.telegramSent); void qc.invalidateQueries({ queryKey: marketKeys.list }); },
    onError: (e) => {
      errorHaptic();
      const active = activePurchaseOf(e);
      if (active) return track({ ...active, amount: 0 }, true);
      if (e instanceof ApiError && e.status === 401) return onLogin();
      setProviderFailed(e instanceof ApiError && PROVIDER_FAILED.has(e.code ?? ""));
      setError(errText(e));
    },
  });

  const key = tracked ? tracked.orderId || tracked.workId : "";
  useMarketSync();
  const order = useMarketOrder(key, !!tracked);
  const found = order.data ?? null;
  const phase: PurchasePhase | null = tracked ? (found ? phaseOfOrder(found) : phaseOfStatus(tracked.status, tracked.paymentStatus)) : null;
  const submit = f.handleSubmit((v) => { setError(""); go.mutate(v); });
  // After an online provider refused: the same request once more, approved through Telegram.
  const viaTelegram = f.handleSubmit((v) => { setError(""); setProvider("telegram_manual"); go.mutate({ ...v, via: "telegram_manual" }); });
  return {
    form: f, options, q, channel, setChannel, contactSpeed, setContactSpeed, urgency, setUrgency, providers, provider, setProvider, providerFailed, viaTelegram,
    tracked, found, phase, error, sending: go.isPending, submit, reset: () => { setTracked(null); setError(""); setProviderFailed(false); }, check: () => order.refetch(), checking: order.isFetching,
  };
}
