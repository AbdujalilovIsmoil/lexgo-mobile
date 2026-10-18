import { useState } from "react";
import { View } from "react-native";
import { ScheduleRow, useLive, useLocalPaged, useNames, useSchedules } from "@/entities/admin-hrm";
import { ScheduleForm } from "@/features/admin-hrm";
import { HrmFilterSheet, NO_FILTERS, ScheduleHero, countFilters } from "@/widgets/admin-hrm";
import { AdminPage, PagedList } from "@/shared/ui/admin";
import { IconButton } from "@/shared/ui";
import { useT } from "@/shared/i18n";

// Work schedules (internal_time.manage): weekly schedules per employee, unit or company-wide; create new ones.
export default function SchedulesPage() {
  const { t } = useT();
  const names = useNames();
  const [f, setF] = useState(NO_FILTERS);
  const [filterOpen, setFilterOpen] = useState(false);
  const [form, setForm] = useState(false);
  useLive();
  const query = useSchedules(f.employeeId, f.unitId);
  const { items, query: paged } = useLocalPaged(query, query.data ?? []);
  return (
    <AdminPage
      title={t("admHrm.nav.schedules")} subtitle={t("admHrmB.total", { n: query.data?.length ?? 0 })}
      right={<><IconButton icon="filter" badge={countFilters(f) > 0} onPress={() => setFilterOpen(true)} /><IconButton icon="plus" onPress={() => setForm(true)} /></>}
    >
      <PagedList
        data={items} query={paged} keyExtractor={(s) => s.id} empty={{ icon: "calendar", title: t("admHrmC.noSchedules") }} off={{ title: t("admHrmC.offTitle"), text: t("admHrmC.offText") }}
        header={<View style={{ marginBottom: 10 }}><ScheduleHero all={query.data ?? []} /></View>}
        renderItem={(s, i) => <ScheduleRow index={i} item={s} scope={[names.employee(s.employeeId), names.unit(s.unitId)].filter(Boolean).join(" · ")} />}
      />
      <ScheduleForm visible={form} onClose={() => setForm(false)} />
      <HrmFilterSheet visible={filterOpen} onClose={() => setFilterOpen(false)} value={f} onChange={setF} fields={["employee", "unit"]} />
    </AdminPage>
  );
}
