import { useState } from "react";
import { View } from "react-native";
import { DayRow, useDays, useLive, useLocalPaged, useNames } from "@/entities/admin-hrm";
import { EventCard, HrmFilterSheet, NO_FILTERS, TimeHero, countFilters } from "@/widgets/admin-hrm";
import { AdminPage, PagedList, isDate } from "@/shared/ui/admin";
import { IconButton } from "@/shared/ui";
import { useT } from "@/shared/i18n";

// Time (internal_time.manage): record attendance events for anyone and browse everybody's attendance days.
export default function TimePage() {
  const { t } = useT();
  const names = useNames();
  const [f, setF] = useState(NO_FILTERS);
  const [filterOpen, setFilterOpen] = useState(false);
  useLive();
  const query = useDays({ employee_id: f.employeeId, date_from: isDate(f.from) ? f.from : "", date_to: isDate(f.to) ? f.to : "" });
  const { items, query: paged } = useLocalPaged(query, query.data ?? []);
  return (
    <AdminPage title={t("admHrm.nav.time")} subtitle={t("admHrmB.total", { n: query.data?.length ?? 0 })} right={<IconButton icon="filter" badge={countFilters(f) > 0} onPress={() => setFilterOpen(true)} />}>
      <PagedList
        data={items} query={paged} keyExtractor={(d) => d.id} renderItem={(d, i) => <DayRow index={i} item={d} name={names.employee(d.employeeId)} />}
        empty={{ icon: "clock", title: t("admHrm.noDays") }} off={{ title: t("admHrmC.offTitle"), text: t("admHrmC.offText") }} header={<View style={{ gap: 10, marginBottom: 10 }}><TimeHero days={query.data ?? []} /><EventCard /></View>}
      />
      <HrmFilterSheet visible={filterOpen} onClose={() => setFilterOpen(false)} value={f} onChange={setF} fields={["employee", "dates"]} />
    </AdminPage>
  );
}
