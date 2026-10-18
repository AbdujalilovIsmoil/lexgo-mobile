import { useState } from "react";
import { PaymentPendingCard } from "@/features/payments";
import { methodLabel, paymentTitle, phaseOf, usePayment } from "@/entities/payment";
import { PaymentHero, ReceiptSection, RefundSheet, SplitSection } from "@/widgets/payments";
import { AdminPage, FactRows, SectionCard } from "@/shared/ui/admin";
import { PayScroll } from "@/shared/ui/pay/PayScroll";
import { Button, EmptyState, ErrorView, Skeleton } from "@/shared/ui";
import { useT } from "@/shared/i18n";

// One payment: state (with the pending-confirmation card while it waits), facts, receipt, split.
export function PaymentDetailPage({ id }: { id: string }) {
  const { t } = useT();
  const q = usePayment(id);
  const [refund, setRefund] = useState(false);
  const p = q.payment;
  const phase = p ? phaseOf(p) : null;
  return (
    <AdminPage title={p ? paymentTitle(p, t) : t("py2.detail")}>
      <PayScroll refreshing={q.isRefetching} onRefresh={() => void q.refetch()}>
        {q.isLoading ? <Skeleton height={140} round={20} /> : q.isError ? <ErrorView error={q.error} onRetry={() => void q.refetch()} /> : !p ? <EmptyState icon="credit-card" title={t("py2.notFound")} /> : (
          <>
            <PaymentHero p={p} />
            {phase === "pending_confirmation" || phase === "awaiting" ? <PaymentPendingCard paymentId={p.id} /> : null}
            <SectionCard title={t("py2.facts")}>
              <FactRows rows={[{ label: t("py2.kind"), value: paymentTitle(p, t) }, { label: t("py2.method"), value: methodLabel(p.method, t) }, { label: t("py2.workId"), value: p.workId }]} />
            </SectionCard>
            <ReceiptSection p={p} />
            <SplitSection id={p.id} enabled={phase === "paid"} />
            {phase === "paid" ? <Button title={t("py2.refund.cta")} icon="rotate-ccw" variant="line" full onPress={() => setRefund(true)} /> : null}
            <RefundSheet payment={p} visible={refund} onClose={() => setRefund(false)} />
          </>
        )}
      </PayScroll>
    </AdminPage>
  );
}
