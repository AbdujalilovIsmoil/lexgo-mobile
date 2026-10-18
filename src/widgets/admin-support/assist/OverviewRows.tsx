import { docPayPhase, isPeriod, serverIso, type AssistDoc, type AssistOrder, type AssistPending, type AssistSub } from "@/entities/admin-support";
import { RowCard, StatusPill } from "@/shared/ui/admin";
import { Pill } from "@/shared/ui";
import { fmtDate, fmtDateTime } from "@/shared/lib/format";
import { useT } from "@/shared/i18n";
import { useSum } from "./useSum";

type Names = Record<string, string>;
const join = (...p: string[]) => p.filter(Boolean).join(" · ");

// Row builders of the "client status" drawer (subscription, pending request, document, order).
export function useOverviewRows(names: Names) {
  const { t, locale } = useT();
  const sum = useSum();
  const period = (p: string, months = 0) => (isPeriod(p) ? t(`admSupC.period.${p}`) : months > 0 ? t("admSupC.months", { n: months }) : p);
  const via = (on: boolean) => (on ? <Pill label={t("admSupB.overview.via")} tone="cy" small /> : null);
  return {
    sub: (x: AssistSub) => (
      <RowCard key={x.id || x.planId} icon="award" title={names[x.planId] || t("admSupB.overview.plan")} subtitle={join(period(x.billingPeriod), x.endsAt ? t("admSupB.overview.until", { date: fmtDate(serverIso(x.endsAt), locale) }) : "")} right={<StatusPill status={x.status} />} />
    ),
    pending: (x: AssistPending) => (
      <RowCard key={x.id} icon="clock" tint="#F59E0B" title={x.planTitle || names[x.planId] || names[x.planSlug] || t("admSupB.overview.plan")} right={<StatusPill status={x.status} />}
        subtitle={join(x.workId, period(x.billingPeriod, x.months), x.amount > 0 ? sum(x.amount, x.currency) : "", x.createdAt ? fmtDateTime(serverIso(x.createdAt), locale) : "")}>{via(x.viaOperator)}</RowCard>
    ),
    doc: (x: AssistDoc) => (
      <RowCard key={x.id} icon="file-text" title={x.title || x.workId} subtitle={join(x.workId, x.requestedType)}
        right={docPayPhase(x) === "pending" ? <Pill label={t("admSupB.pay.pendingShort")} tone="warn" small /> : <StatusPill status={x.status} />}>{via(x.viaOperator)}</RowCard>
    ),
    order: (x: AssistOrder) => (
      <RowCard key={x.id} icon="briefcase" title={x.title || x.workId} subtitle={join(x.workId, x.lawyerName, x.price > 0 ? sum(x.price, x.currency) : "")} right={<StatusPill status={x.status} />}>{via(x.viaOperator)}</RowCard>
    ),
  };
}
