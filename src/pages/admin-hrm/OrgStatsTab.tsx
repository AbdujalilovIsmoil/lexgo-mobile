import { RefreshScroll, useBoard, useRefreshAll } from "@/entities/admin-hrm";
import { OrgStatsView } from "@/widgets/admin-hrm";
import { QueryBoundary } from "@/shared/ui/admin";

// Organization in numbers (counters, headcount per unit, units by type).
export function OrgStatsTab() {
  const q = useBoard();
  const refresh = useRefreshAll();
  return (
    <QueryBoundary query={q}>
      <RefreshScroll refreshing={q.isRefetching} onRefresh={refresh}>{q.data ? <OrgStatsView board={q.data} /> : <></>}</RefreshScroll>
    </QueryBoundary>
  );
}
