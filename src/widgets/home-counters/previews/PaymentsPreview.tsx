import { isPendingPayment, usePayments } from "@/entities/client-stats";
import { PaymentRow, useKindNav } from "@/features/dashboard-kinds";
import { useT } from "@/shared/i18n";
import { PreviewList } from "./PreviewList";

type Props = { go: (fn: () => void) => void };

// Drawer rows of "To'lovlar": payment requests still waiting for the provider.
export function PaymentsPreview({ go }: Props) {
  const { t } = useT();
  const nav = useKindNav();
  const q = usePayments();
  const items = (q.data ?? []).filter(isPendingPayment).slice(0, 5);
  return <PreviewList query={q} items={items} keyOf={(p) => p.id} empty={{ icon: "credit-card", title: t("cl6.counters.paymentsNone"), text: t("cl7.empty.paymentsText") }} render={(p) => <PaymentRow payment={p} onPress={() => go(() => nav.payment(p.id))} />} />;
}
