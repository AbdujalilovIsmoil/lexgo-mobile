import { useState } from "react";
import { isPendingPayment, usePayments } from "@/entities/client-stats";
import { PaymentRow, useKindNav } from "@/features/dashboard-kinds";
import { useT } from "@/shared/i18n";
import { PagedList } from "@/shared/ui/admin";
import { KindChips } from "./KindChips";

type Filter = "pending" | "all";

// Counter "To'lovlar": the client's payment requests; pending ones wait for the provider.
export function PaymentsKind() {
  const { t } = useT();
  const nav = useKindNav();
  const query = usePayments();
  const [filter, setFilter] = useState<Filter>("pending");
  const all = query.data ?? [];
  const items = filter === "all" ? all : all.filter(isPendingPayment);
  return (
    <PagedList
      data={items}
      query={query}
      keyExtractor={(p) => p.id}
      header={<KindChips<Filter> value={filter} onChange={setFilter} options={[{ value: "pending", label: t("cl7.filters.pending"), count: all.filter(isPendingPayment).length }, { value: "all", label: t("cl7.filters.all"), count: all.length }]} />}
      empty={{ icon: "credit-card", title: t("cl7.empty.payments"), text: t("cl7.empty.paymentsText") }}
      renderItem={(p) => <PaymentRow payment={p} onPress={() => nav.payment(p.id)} />}
    />
  );
}
