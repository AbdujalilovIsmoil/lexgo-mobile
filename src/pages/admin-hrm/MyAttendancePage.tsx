import { View } from "react-native";
import { DayRow, useAttendancePaged, useLive } from "@/entities/admin-hrm";
import { AttendanceCard, AttendanceHero } from "@/widgets/admin-hrm";
import { AdminPage, DateRangeBar, PagedList, useDateRange } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";

// My attendance: clock-in hero, period summary with a day heat strip, then the day tickets for the chosen period.
export default function MyAttendancePage() {
  const { t } = useT();
  const bar = useDateRange("d30");
  const { items, query: paged } = useAttendancePaged(bar.range.from, bar.range.to);
  useLive();
  return (
    <AdminPage title={t("admHrm.nav.attendance")} subtitle={t("admHrmB.navDesc.attendance")}>
      <PagedList
        data={items} query={paged} keyExtractor={(x) => x.id} renderItem={(x, i) => <DayRow index={i} item={x} />} empty={{ icon: "calendar", title: t("admHrm.noDays") }}
        header={<View style={{ gap: 12, marginBottom: 10 }}><AttendanceCard /><View style={{ marginHorizontal: -16 }}><DateRangeBar bar={bar} withAll /></View><AttendanceHero days={items} /></View>}
      />
    </AdminPage>
  );
}
