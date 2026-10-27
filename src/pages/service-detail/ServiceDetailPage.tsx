import { View } from "react-native";
import { useServicePassport } from "@/entities/service";
import { useServiceRuntime } from "@/entities/service-runtime";
import { ServicePageView } from "@/widgets/service-sheets";
import { ErrorView, Screen, Skeleton } from "@/shared/ui";
import { AdminPage } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";

type Props = { id: string; packageId?: string; lawyer?: string; name?: string };

// Full-page service (a tap in the Services tab, links from other roles and notifications; /services/[id]): hero, facts,
// papers, order. A package or a directory advocate rides along to the order. The runtime configuration (duration, review,
// checklist, rules, guarantees) is asked for together with the passport — the page shares that one query — and never holds the page up.
export function ServiceDetailPage({ id, packageId, lawyer, name }: Props) {
  const { t } = useT();
  const q = useServicePassport(id);
  const rt = useServiceRuntime(id);
  return (
    <AdminPage title={q.data?.service.name ?? t("dc1.detailTitle")}>
      {q.isError ? (
        <ErrorView error={q.error} onRetry={() => void q.refetch()} />
      ) : !q.data ? (
        <View style={{ padding: 16, gap: 12 }}>
          <Skeleton height={30} /><Skeleton height={80} round={18} /><Skeleton height={160} round={18} />
        </View>
      ) : (
        <Screen topInset={false} refreshing={q.isRefetching} onRefresh={() => { void q.refetch(); void rt.refetch(); }}>
          <ServicePageView data={q.data} packageId={packageId} preSeller={lawyer ? { id: lawyer, name: name ?? "" } : undefined} />
        </Screen>
      )}
    </AdminPage>
  );
}
