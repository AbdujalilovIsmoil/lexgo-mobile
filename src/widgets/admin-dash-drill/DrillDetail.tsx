import { View } from "react-native";
import { useDrilldown, useListRow, type Drill } from "@/entities/admin-dash";
import { useT } from "@/shared/i18n";
import { Skeleton, Text } from "@/shared/ui";
import { DrillSectionView } from "./DrillSectionView";

// The real records behind a metric (GET /admin/dashboard/drilldown), loaded while the sheet is open.
export function DrillDetail({ detail }: { detail: NonNullable<Drill["detail"]> }) {
  const { t } = useT();
  const toRow = useListRow();
  const q = useDrilldown(detail.metric, detail.filter);
  const title = t("admDashB.drill.details");
  if (q.isLoading) return <View style={{ gap: 8 }}><Text variant="small" weight="bold" tone="gray">{title}</Text><Skeleton height={56} round={16} /></View>;
  if (q.isError) return <DrillSectionView s={{ kind: "list", title, rows: [], empty: t("admDashB.drill.backendWait") }} />;
  const rows = (q.data ?? []).map(toRow);
  return <DrillSectionView s={{ kind: "list", title, rows }} />;
}
