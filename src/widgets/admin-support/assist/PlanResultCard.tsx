import type { AssistContext, AssistSent } from "@/entities/admin-support";
import { planPhaseNow } from "@/entities/admin-support";
import { useT } from "@/shared/i18n";
import { PayState } from "./PayState";
import { ResultCard } from "./ResultCard";
import { useResultRows } from "./useResultRows";
import { useSum } from "./useSum";

type Plan = Extract<AssistSent, { kind: "plan" }>;

// Subscription request: pending Telegram approval → paid (a new active subscription appears) or reviewed/rejected.
export function PlanResultCard({ s, ctx, ctxAt, onDismiss }: { s: Plan; ctx: AssistContext; ctxAt: number; onDismiss: () => void }) {
  const { t } = useT();
  const sum = useSum();
  const r = useResultRows();
  const { phase, reviewed } = planPhaseNow(s.data, s.subsBefore, ctx, ctxAt, s.at);
  const open = !phase && !reviewed;
  const note = reviewed ? t("admSupB.pay.planReviewed") : phase === "paid" ? t("admSupB.pay.planPaid") : phase === "rejected" ? t("admSupB.pay.rejectedNote") : undefined;
  return (
    <ResultCard
      title={t("admSupC.plan.sentTitle")}
      warn={!s.data.telegramSent || phase === "rejected"}
      note={note}
      onDismiss={onDismiss}
      rows={[
        r.work(s.data.workId),
        { label: t("admSupC.plan.plan"), value: [s.planName, s.data.planSlug ? `(${s.data.planSlug})` : ""].filter(Boolean).join(" ") },
        { label: t("admSupC.plan.period"), value: t(`admSupC.period.${s.period}`) },
        { label: t("adm.amount"), value: open ? sum(s.data.amount, s.data.currency) : "" },
        open ? r.status(s.data.status) : { label: "", value: "" },
        r.tg(s.data.telegramSent),
      ]}
    >
      <PayState phase={phase} amount={s.data.amount} currency={s.data.currency} />
    </ResultCard>
  );
}
