import { useMemo, useState } from "react";
import { planPeriods, planPrice, resultKey, sellablePlans, useCheckoutPlan, usePlans, usePreviewPlan, type PlanPreview, type Period } from "@/entities/admin-support";
import type { Fact } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";
import { useAssistStep } from "./AssistFormSheet";
import type { FlowProps } from "./flowTypes";
import { useAssistError } from "./useAssistError";
import { useSum } from "./useSum";

type Quote = { planId: string; period: Period; data: PlanPreview };

// Subscription for the client: pick plan + period → price quote (shown in the client's chat) → payment request to Telegram.
export function usePlanFlow({ ticketId, client, clientName, ctx, visible, onClose, onSent, onBlock }: FlowProps) {
  const { t, locale } = useT();
  const sum = useSum();
  const errText = useAssistError();
  const plans = usePlans(locale, visible);
  const list = useMemo(() => sellablePlans(plans.data ?? []), [plans.data]);
  const [sel, setSel] = useState<{ planId: string; period: Period }>({ planId: "", period: "monthly" });
  const [quote, setQuote] = useState<Quote | null>(null);
  const [err, setErr] = useState("");
  const step = useAssistStep();
  const preview = usePreviewPlan(ticketId);
  const checkout = useCheckoutPlan(ticketId);
  const plan = list.find((p) => p.id === sel.planId) ?? list[0] ?? null;
  const periods = plan ? planPeriods(plan) : [];
  const period: Period = periods.includes(sel.period) ? sel.period : (periods[0] ?? "monthly");
  const fresh = quote && plan && quote.planId === plan.id && quote.period === period ? quote.data : null;
  const close = () => { step.reset(); setQuote(null); setErr(""); onClose(); };

  const runPreview = () => {
    if (!plan) return;
    setErr("");
    preview.mutate({ planId: plan.id, period }, { onSuccess: (data) => setQuote({ planId: plan.id, period, data }), onError: (e) => !onBlock(e) && setErr(errText(e)) });
  };
  const submit = () => {
    if (!plan || !fresh) return;
    checkout.mutate({ planId: plan.id, period }, {
      onSuccess: (data) => {
        const planId = data.planId || plan.id;
        onSent({ kind: "plan", key: resultKey("plan", data.workId, data.id), data: { ...data, planId }, planName: plan.name, period, subsBefore: ctx.subs.filter((s) => s.planId === planId).map((s) => s.id), at: Date.now() });
        close();
      },
      onError: (e) => (onBlock(e) ? close() : step.setErr(errText(e))),
    });
  };
  const rows: Fact[] = fresh && plan ? [
    { label: t("admSupC.confirm.client"), value: [client?.name || clientName, client?.lexgoId].filter(Boolean).join(" · ") },
    { label: t("admSupC.plan.plan"), value: plan.name },
    { label: t("admSupC.plan.period"), value: t(`admSupC.period.${period}`) },
    { label: t("adm.amount"), value: sum(fresh.amount, fresh.currency) },
  ] : [];
  return { list, plans, plan, periods, period, listPrice: plan ? sum(planPrice(plan, period)) : "", fresh, stale: Boolean(quote && !fresh), err, step, rows, busy: checkout.isPending, previewing: preview.isPending, setSel, runPreview, submit, close, sum };
}
