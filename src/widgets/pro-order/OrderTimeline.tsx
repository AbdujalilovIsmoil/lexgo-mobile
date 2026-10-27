import { useOrderHistory, useOrderMilestones, OrderStatusPill } from "@/entities/pro-order";
import { useFlowTimeline } from "@/entities/market-flow";
import { eventText } from "@/widgets/market-order";
import { RowCard, SectionCard } from "@/shared/ui/admin";
import { Skeleton, Text } from "@/shared/ui";
import { fmtDateTime, humanizeSlug } from "@/shared/lib/format";
import { useSom } from "@/shared/lib/sel";
import { useT } from "@/shared/i18n";

// The order's history, newest first — the unified timeline (GET …/timeline: steps, cancellation reviews, reassignments, refunds, with
// who did it) and, without one, /status-history (who moved it where, with notes) — then the payment milestones. Read-only.
export function OrderTimeline({ orderId }: { orderId: string }) {
  const { t, locale } = useT();
  const som = useSom();
  const flow = useFlowTimeline(orderId);
  const unified = flow.data ?? [];
  const hist = useOrderHistory(orderId, flow.isFetched && !unified.length);
  const miles = useOrderMilestones(orderId);
  const status = (s: string) => (t(`sl12.status.${s}`) !== `sl12.status.${s}` ? t(`sl12.status.${s}`) : humanizeSlug(s));
  const steps = unified.length
    ? unified.map((e) => ({ status: e.type === "status" ? e.status : "", text: eventText(e, t, status), at: e.at }))
    : (hist.data ?? []).map((h) => ({ status: h.status, text: { title: "", note: h.note }, at: h.at }));
  const sorted = [...steps].sort((a, b) => (a.at < b.at ? 1 : -1));
  const loading = flow.isLoading || hist.isLoading;
  return (
    <>
      <SectionCard title={t("sl9.history")}>
        {loading ? <Skeleton height={48} round={14} /> : null}
        {!loading && !sorted.length ? <Text variant="small" tone="gray">{t("sl9.historyEmpty")}</Text> : null}
        {sorted.map((x, i) => (
          <RowCard
            key={`${x.at}-${i}`}
            icon="clock"
            title={x.status ? fmtDateTime(x.at, locale) : x.text.title}
            subtitle={[x.status ? "" : fmtDateTime(x.at, locale), x.text.note].filter(Boolean).join(" · ") || undefined}
            right={x.status ? <OrderStatusPill status={x.status} /> : undefined}
          />
        ))}
      </SectionCard>
      {miles.data?.length ? (
        <SectionCard title={t("sl9.milestones")}>
          {miles.data.map((m) => <RowCard key={m.id} icon="flag" title={`${m.index}. ${m.title}`} subtitle={`${m.percent}% · ${som(m.amount)}`} right={<OrderStatusPill status={m.status} />} />)}
        </SectionCard>
      ) : null}
    </>
  );
}
