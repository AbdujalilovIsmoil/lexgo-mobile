import { useMemo } from "react";
import { RefreshControl, ScrollView } from "react-native";
import { AdminPage, QueryBoundary } from "@/shared/ui/admin";
import { useRequest, useUrgentLabels, type Scope } from "@/entities/urgent";
import { useSecondOpinionPurchased } from "@/entities/second-opinion";
import { useInsets } from "@/shared/lib/insets";
import { useT } from "@/shared/i18n";
import { RequestDetail } from "./RequestDetail";

type Props = { id: string; scope: Scope; pool?: boolean };

// A full-page record with pull-to-refresh. The call-center console (and a pool item opened by a call-center lawyer)
// reads the call-center endpoint; everyone else the participant one.
export function DetailScreen({ id, scope, pool }: Props) {
  const { t } = useT();
  const label = useUrgentLabels();
  const insets = useInsets();
  const q = useRequest(id, scope === "cc" || pool ? "cc" : "me");
  const req = q.data;
  const own = useMemo(() => (req && scope === "client" ? [req] : []), [req, scope]);
  useSecondOpinionPurchased(own); // a request born from the group second opinion: `purchased` once it shows as paid
  return (
    <AdminPage title={req ? label.kind(req.serviceKind, req.serviceTitle) : t("ug1.title")} subtitle={req?.workId}>
      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: insets.bottom + 32 }} showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={q.isRefetching} onRefresh={() => void q.refetch()} />}
      >
        <QueryBoundary query={q}>{req ? <RequestDetail req={req} scope={scope} pool={pool} /> : null}</QueryBoundary>
      </ScrollView>
    </AdminPage>
  );
}
