import { fmtUzs, usePayouts } from "@/entities/payment";
import { PagedList, RowCard, StatusPill } from "@/shared/ui/admin";
import { Text } from "@/shared/ui";
import { fmtDate } from "@/shared/lib/format";
import { useSlicedList } from "@/shared/lib/pay/useSlicedList";
import { useT } from "@/shared/i18n";

// Seller earnings (GET /payouts/me), read-only: amount, period and the backend's payout status.
export function PayoutsList() {
  const { t, locale } = useT();
  const q = usePayouts(true);
  const { items, query } = useSlicedList(q.data ?? [], q, "payouts");
  return (
    <PagedList
      data={items}
      query={query}
      keyExtractor={(p) => p.id}
      renderItem={(p) => <RowCard icon="trending-up" title={fmtUzs(p.amount, t)} subtitle={p.period || undefined} meta={fmtDate(p.createdAt, locale)} right={<StatusPill status={p.status} />} />}
      empty={{ icon: "trending-up", title: t("py1.earn.empty"), text: t("py1.earn.emptyText") }}
      header={<Text variant="small" tone="gray" style={{ paddingBottom: 12 }}>{t("py1.earn.note")}</Text>}
    />
  );
}
