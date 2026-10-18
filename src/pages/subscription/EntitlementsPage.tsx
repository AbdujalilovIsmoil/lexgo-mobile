import { useRouter } from "expo-router";
import { useEntitlements, usePlans } from "@/entities/plan";
import { ActiveSubCard, DocsAccess, PendingRequests, SharedMembers } from "@/widgets/subscription";
import { AdminPage, QueryBoundary, SectionCard } from "@/shared/ui/admin";
import { PayScroll } from "@/shared/ui/pay/PayScroll";
import { Button, EmptyState } from "@/shared/ui";
import { useT } from "@/shared/i18n";

// "What my plan gives": active subscriptions with their functions and limits, document access,
// family members who share it, and tariff requests still waiting for an operator.
export function EntitlementsPage() {
  const { t } = useT();
  const router = useRouter();
  const q = useEntitlements();
  const plans = usePlans();
  const byId = new Map((plans.data ?? []).map((p) => [p.id, p]));
  const e = q.data;
  return (
    <AdminPage title={t("py4.title")}>
      <QueryBoundary query={q}>
        <PayScroll refreshing={q.isRefetching} onRefresh={() => void q.refetch()}>
          {e && e.subs.length ? e.subs.map((s) => <ActiveSubCard key={s.id} sub={s} plan={byId.get(s.planId)} />) : (
            <SectionCard><EmptyState compact icon="credit-card" title={t("py4.none.title")} text={t("py4.none.text")} /></SectionCard>
          )}
          {e ? <DocsAccess docs={e.docs} aiLimit={e.aiLimit} /> : null}
          {e ? <SharedMembers items={e.shared} /> : null}
          {e ? <PendingRequests items={e.pending} /> : null}
          <Button title={t("py4.plans")} icon="credit-card" variant="gradient" full onPress={() => router.push("/subscription")} />
        </PayScroll>
      </QueryBoundary>
    </AdminPage>
  );
}
