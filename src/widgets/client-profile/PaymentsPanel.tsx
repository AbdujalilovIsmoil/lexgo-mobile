import { useState } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { groupOf, paymentTitle, PaymentRowCard, statusLabel, usePayments, type PayGroup, type PaymentRow } from "@/entities/payment";
import { PaymentFilters, PaymentSummary } from "@/widgets/payments";
import { Divider, EmptyState } from "@/shared/ui";
import { ProfileSection, RowsSkeleton, ShowMore, useShowMore } from "@/shared/ui/profile";
import { useDateRange } from "@/shared/ui/admin";
import { useDebounced } from "@/shared/lib/useDebounced";
import { useT } from "@/shared/i18n";

const GROUPS: PayGroup[] = ["pending", "paid", "failed", "refunded"];

// The web "To'lovlar" page inside the profile: totals, status groups, search and period over GET /payments, ten rows
// at a time. A tap opens the receipt screen.
export function PaymentsPanel() {
  const { t } = useT();
  const router = useRouter();
  const q = usePayments();
  const bar = useDateRange("all");
  const [group, setGroup] = useState<PayGroup>("all");
  const [search, setSearch] = useState("");
  const needle = useDebounced(search.trim().toLowerCase(), 250);
  const inRange = (p: PaymentRow) => { const d = p.createdAt.slice(0, 10); return (!bar.range.from || !d || d >= bar.range.from) && (!bar.range.to || !d || d <= bar.range.to); };
  const base = (q.data ?? []).filter((p) => inRange(p) && (!needle || `${paymentTitle(p, t)} ${statusLabel(p.status, t)} ${p.amount}`.toLowerCase().includes(needle)));
  const counts = Object.fromEntries([["all", base.length], ...GROUPS.map((g) => [g, base.filter((p) => groupOf(p.status) === g).length])]) as Record<PayGroup, number>;
  const rows = group === "all" ? base : base.filter((p) => groupOf(p.status) === group);
  const page = useShowMore(rows, `${group}|${needle}|${bar.range.from}|${bar.range.to}`);
  const some = !!q.data?.length;
  return (
    <ProfileSection accent="green" icon="credit-card" title={t("ntd.pfPayTitle")} badge={q.data ? q.data.length : undefined}>
      {q.isLoading ? <RowsSkeleton /> : !some ? <EmptyState compact icon="credit-card" title={t("py1.empty")} text={t("py1.emptyText")} /> : (
        <>
          <PaymentSummary rows={base} />
          <PaymentFilters group={group} onGroup={setGroup} counts={counts} search={search} onSearch={setSearch} bar={bar} />
          {rows.length ? (
            <View>
              {page.visible.map((p, i) => <View key={p.id}>{i ? <Divider inset={56} /> : null}<PaymentRowCard item={p} onPress={() => router.push(`/payments/${p.id}`)} /></View>)}
              <ShowMore left={page.left} expanded={page.expanded} onMore={page.more} onLess={page.less} />
            </View>
          ) : <EmptyState compact icon="search" title={t("py1.noResults")} text={t("py1.noResultsText")} />}
        </>
      )}
    </ProfileSection>
  );
}
