import { RefreshScroll, useLive, useRefreshAll, useToday } from "@/entities/admin-hrm";
import { AttendanceCard, DashHello, DashLists, DashStats } from "@/widgets/admin-hrm";
import { AdminPage, QueryBoundary } from "@/shared/ui/admin";
import { fmtDate } from "@/shared/lib/format";
import { useT } from "@/shared/i18n";

// My workday: greeting, clock-in hero, four live counters, open tasks and unread messages (refreshed every 20 s).
export default function DashboardPage() {
  const { t, locale } = useT();
  const q = useToday();
  const refresh = useRefreshAll();
  useLive();
  return (
    <AdminPage title={t("admHrm.nav.dashboard")} subtitle={fmtDate(q.data?.date, locale)}>
      <QueryBoundary query={q}>
        <RefreshScroll refreshing={q.isRefetching} onRefresh={refresh}>
          <DashHello />
          <AttendanceCard />
          <DashStats />
          <DashLists />
        </RefreshScroll>
      </QueryBoundary>
    </AdminPage>
  );
}
