import { RefreshScroll, useProfile, useRefreshAll } from "@/entities/admin-hrm";
import { AttendanceCard, ProfileCard, ProfileKpis } from "@/widgets/admin-hrm";
import { AdminPage, QueryBoundary } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";

// My profile: clock-in hero, employee card with placement and contacts, and my KPIs for the current month.
export default function ProfilePage() {
  const { t } = useT();
  const q = useProfile();
  const refresh = useRefreshAll();
  return (
    <AdminPage title={t("admHrm.nav.me")} subtitle={t("admHrmB.navDesc.me")}>
      <QueryBoundary query={q}>
        <RefreshScroll refreshing={q.isRefetching} onRefresh={refresh}>
          <AttendanceCard />
          <ProfileCard />
          <ProfileKpis />
        </RefreshScroll>
      </QueryBoundary>
    </AdminPage>
  );
}
