import { useOrderHistory, useOrderMilestones, OrderStatusPill } from "@/entities/pro-order";
import { RowCard, SectionCard } from "@/shared/ui/admin";
import { Skeleton, Text } from "@/shared/ui";
import { fmtDateTime } from "@/shared/lib/format";
import { useSom } from "@/shared/lib/sel";
import { useT } from "@/shared/i18n";

// Status history (who moved it where, with notes) and the payment milestones — read-only.
export function OrderTimeline({ orderId }: { orderId: string }) {
  const { t, locale } = useT();
  const som = useSom();
  const hist = useOrderHistory(orderId);
  const miles = useOrderMilestones(orderId);
  const steps = [...(hist.data ?? [])].sort((a, b) => (a.at < b.at ? 1 : -1));
  return (
    <>
      <SectionCard title={t("sl9.history")}>
        {hist.isLoading ? <Skeleton height={48} round={14} /> : null}
        {!hist.isLoading && !steps.length ? <Text variant="small" tone="gray">{t("sl9.historyEmpty")}</Text> : null}
        {steps.map((x, i) => <RowCard key={`${x.at}-${i}`} icon="clock" title={fmtDateTime(x.at, locale)} subtitle={x.note || undefined} right={<OrderStatusPill status={x.status} />} />)}
      </SectionCard>
      {miles.data?.length ? (
        <SectionCard title={t("sl9.milestones")}>
          {miles.data.map((m) => <RowCard key={m.id} icon="flag" title={`${m.index}. ${m.title}`} subtitle={`${m.percent}% · ${som(m.amount)}`} right={<OrderStatusPill status={m.status} />} />)}
        </SectionCard>
      ) : null}
    </>
  );
}
