import type { AssistContext, AssistSent } from "@/entities/admin-support";
import { marketPhaseNow } from "@/entities/admin-support";
import { useT } from "@/shared/i18n";
import { humanizeSlug } from "@/shared/lib/format";
import { PayState } from "./PayState";
import { ResultCard } from "./ResultCard";
import { useResultRows } from "./useResultRows";
import { useSum } from "./useSum";

type Market = Extract<AssistSent, { kind: "market" }>;

// Marketplace request: payment approval progress and the next backend step.
export function MarketResultCard({ s, ctx, onDismiss }: { s: Market; ctx: AssistContext; onDismiss: () => void }) {
  const { t } = useT();
  const sum = useSum();
  const r = useResultRows();
  const m = s.data;
  const phase = marketPhaseNow(m, ctx);
  const final = phase === "paid" || phase === "rejected";
  const next = t(`admSupC.market.nextSt.${m.nextStatus}`);
  return (
    <ResultCard
      title={t("admSupC.market.sentTitle")}
      warn={!m.telegramSent || phase === "rejected"}
      note={phase === "paid" ? t("admSupB.pay.marketPaid") : phase === "rejected" ? t("admSupB.pay.rejectedNote") : m.sellerAfterPayment ? t("admSupC.market.afterPayment") : undefined}
      onDismiss={onDismiss}
      rows={[
        r.work(m.workId),
        { label: t("admSupC.market.service"), value: m.serviceTitle },
        { label: t("admSupC.market.seller"), value: m.lawyerName },
        { label: t("adm.amount"), value: !phase && m.amount > 0 ? sum(m.amount, m.currency) : "" },
        phase ? { label: "", value: "" } : r.status(m.status),
        r.tg(m.telegramSent),
        { label: t("admSupB.result.next"), value: !final && m.nextStatus ? (next !== `admSupC.market.nextSt.${m.nextStatus}` ? next : humanizeSlug(m.nextStatus)) : "" },
      ]}
    >
      <PayState phase={phase} amount={m.gate?.amount || m.amount} currency={m.gate?.currency || m.currency} />
    </ResultCard>
  );
}
