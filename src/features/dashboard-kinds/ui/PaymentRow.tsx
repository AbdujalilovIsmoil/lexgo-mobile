import type { Payment } from "@/entities/client-stats";
import { useT } from "@/shared/i18n";
import { fmtDate, humanizeSlug } from "@/shared/lib/format";
import { fmtMoney } from "@/shared/lib/money";
import { RowCard, StatusPill } from "@/shared/ui/admin";

// One payment request: what it is for, the amount and the server's status.
export function PaymentRow({ payment, onPress }: { payment: Payment; onPress: () => void }) {
  const { t, locale } = useT();
  const key = `cl7.payKind.${payment.kind}`;
  const title = t(key) !== key ? t(key) : humanizeSlug(payment.kind || payment.description);
  return (
    <RowCard icon="credit-card" tint="#C2680A" title={title} subtitle={`${fmtMoney(payment.amount)} ${t("common.currency")}`} meta={fmtDate(payment.createdAt, locale)} right={<StatusPill status={payment.status} />} onPress={onPress} />
  );
}
