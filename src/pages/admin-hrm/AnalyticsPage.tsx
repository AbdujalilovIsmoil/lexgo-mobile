import { useState } from "react";
import { View } from "react-native";
import { analyticsExportPath, RefreshScroll, useAnalytics, useRefreshAll } from "@/entities/admin-hrm";
import { AnalyticsBlocks } from "@/widgets/admin-hrm";
import { AdminPage, DateRangeBar, QueryBoundary, isDate, useDateRange } from "@/shared/ui/admin";
import { IconButton, toast } from "@/shared/ui";
import { downloadAndShare } from "@/shared/lib/files";
import { useT } from "@/shared/i18n";

const XLSX = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

// Analytics (internal_analytics.view): the HRM dashboard blocks for a period and the .xlsx export through the share sheet.
export default function AnalyticsPage() {
  const { t } = useT();
  const bar = useDateRange("all");
  const from = isDate(bar.range.from) ? bar.range.from : "";
  const to = isDate(bar.range.to) ? bar.range.to : "";
  const q = useAnalytics(from, to);
  const refresh = useRefreshAll();
  const [busy, setBusy] = useState(false);
  const exportXlsx = async () => {
    setBusy(true);
    try {
      await downloadAndShare(analyticsExportPath({ date_from: from, date_to: to }), "lexgo-internal-analytics.xlsx", XLSX);
    } catch {
      toast(t("adm.actionFailed"), "err");
    } finally {
      setBusy(false);
    }
  };
  return (
    <AdminPage title={t("admHrm.nav.analytics")} subtitle={t("admHrmB.navDesc.analytics")} right={<IconButton icon={busy ? "loader" : "download"} onPress={busy ? undefined : () => void exportXlsx()} label={t("adm.export")} />}>
      <RefreshScroll refreshing={q.isRefetching} onRefresh={refresh}>
        <View style={{ marginHorizontal: -16 }}><DateRangeBar bar={bar} withAll /></View>
        <QueryBoundary query={q}><AnalyticsBlocks blocks={q.data ?? []} /></QueryBoundary>
      </RefreshScroll>
    </AdminPage>
  );
}
