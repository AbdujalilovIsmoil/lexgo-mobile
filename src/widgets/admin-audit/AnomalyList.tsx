import { useMemo, useState } from "react";
import { View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { SecurityEventRow, useSecurityEvents, useShown } from "@/entities/admin-audit";
import { PagedList } from "@/shared/ui/admin";
import { CcTiles } from "@/shared/ui/cc";
import { Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";

const STATUSES = ["all", "new", "reviewed", "resolved"];

// Security anomalies (suspicious sign-ins, OTP / password brute force): status tiles with counts, filtered on the device.
export function AnomalyList() {
  const { t } = useT();
  const [status, setStatus] = useState("all");
  const q = useSecurityEvents("all");
  const all = useMemo(() => q.data ?? [], [q.data]);
  const view = useMemo(() => (status === "all" ? all : all.filter((e) => e.status === status)), [all, status]);
  const { items, query } = useShown(view, q);
  const opts = STATUSES.map((s) => ({ value: s, label: t(`admAudit.status.${s}`), count: s === "all" ? all.length : all.filter((e) => e.status === s).length, alert: s === "new" }));
  return (
    <PagedList
      data={items}
      query={query}
      keyExtractor={(e) => e.id}
      renderItem={(e, i) => <Animated.View entering={FadeInUp.delay(Math.min(i, 6) * 40).duration(240)}><SecurityEventRow item={e} /></Animated.View>}
      skeletonHeight={96}
      empty={{ icon: "shield", title: t("admAudit.noAnomalies"), text: t("admAudit.noAnomaliesText") }}
      header={
        <View style={{ gap: 10, paddingBottom: 12 }}>
          <Text variant="small" tone="gray">{t("admAudit.anomLead")}</Text>
          <View style={{ marginHorizontal: -16 }}><CcTiles options={opts} value={status} onChange={setStatus} /></View>
        </View>
      }
    />
  );
}
