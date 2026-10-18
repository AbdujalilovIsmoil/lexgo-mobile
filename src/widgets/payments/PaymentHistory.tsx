import { useState } from "react";
import { useRouter } from "expo-router";
import { groupOf, paymentTitle, PaymentRowCard, statusLabel, usePayments, type PayGroup, type PaymentRow } from "@/entities/payment";
import { PagedList, useDateRange } from "@/shared/ui/admin";
import { useSlicedList } from "@/shared/lib/pay/useSlicedList";
import { useDebounced } from "@/shared/lib/useDebounced";
import { useT } from "@/shared/i18n";
import { MonthHead } from "./MonthHead";
import { PaymentFilters } from "./PaymentFilters";
import { PaymentWallet } from "./PaymentWallet";

const GROUPS: PayGroup[] = ["pending", "paid", "failed", "refunded"];

// Payment history: status groups, search and period filters over what GET /payments returns.
export function PaymentHistory() {
  const { t } = useT();
  const router = useRouter();
  const q = usePayments();
  const bar = useDateRange("all");
  const [group, setGroup] = useState<PayGroup>("all");
  const [search, setSearch] = useState("");
  const needle = useDebounced(search.trim().toLowerCase(), 250);
  const inRange = (p: PaymentRow) => {
    const day = p.createdAt.slice(0, 10);
    return (!bar.range.from || !day || day >= bar.range.from) && (!bar.range.to || !day || day <= bar.range.to);
  };
  const matches = (p: PaymentRow) => !needle || `${paymentTitle(p, t)} ${statusLabel(p.status, t)} ${p.amount}`.toLowerCase().includes(needle);
  const base = (q.data ?? []).filter((p) => inRange(p) && matches(p));
  const counts = Object.fromEntries([["all", base.length], ...GROUPS.map((g) => [g, base.filter((p) => groupOf(p.status) === g).length])]) as Record<PayGroup, number>;
  const rows = group === "all" ? base : base.filter((p) => groupOf(p.status) === group);
  const { items, query } = useSlicedList(rows, q, `${group}|${needle}|${bar.range.from}|${bar.range.to}`);
  const some = !!q.data?.length;
  return (
    <PagedList
      data={items}
      query={query}
      keyExtractor={(p) => p.id}
      flat
      renderItem={(p, i) => <><MonthHead at={p.createdAt} prev={items[i - 1]?.createdAt} /><PaymentRowCard item={p} onPress={() => router.push(`/payments/${p.id}`)} /></>}
      empty={{ icon: "credit-card", title: some ? t("py1.noResults") : t("py1.empty"), text: some ? t("py1.noResultsText") : t("py1.emptyText") }}
      header={<><PaymentWallet rows={base} onGroup={setGroup} /><PaymentFilters group={group} onGroup={setGroup} counts={counts} search={search} onSearch={setSearch} bar={bar} /></>}
    />
  );
}
