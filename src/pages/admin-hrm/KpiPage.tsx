import { useState } from "react";
import { View } from "react-native";
import { KpiRow, useKpis, useLocalPaged, useNames } from "@/entities/admin-hrm";
import { KpiForm } from "@/features/admin-hrm";
import { HrmFilterSheet, KpiSummary, NO_FILTERS, countFilters } from "@/widgets/admin-hrm";
import { AdminPage, PagedList } from "@/shared/ui/admin";
import { IconButton } from "@/shared/ui";
import { useT } from "@/shared/i18n";

// KPI (internal_kpi.manage): metrics per employee and month with an average score; add new metrics.
export default function KpiPage() {
  const { t } = useT();
  const names = useNames();
  const [f, setF] = useState(NO_FILTERS);
  const [filterOpen, setFilterOpen] = useState(false);
  const [form, setForm] = useState(false);
  const query = useKpis(f.employeeId, f.period);
  const { items, query: paged } = useLocalPaged(query, query.data ?? []);
  return (
    <AdminPage
      title={t("admHrm.nav.kpi")} subtitle={f.period || t("admHrmB.navDesc.kpi")}
      right={<><IconButton icon="filter" badge={countFilters(f) > 0} onPress={() => setFilterOpen(true)} /><IconButton icon="plus" onPress={() => setForm(true)} /></>}
    >
      <PagedList
        data={items} query={paged} keyExtractor={(k) => k.id} renderItem={(k, i) => <KpiRow item={k} who={names.employee(k.employeeId)} index={i} />}
        off={{ title: t("admHrmC.offTitle"), text: t("admHrmC.offText") }} empty={{ icon: "target", title: t("admHrmC.noKpis") }} header={query.data?.length ? <View style={{ marginBottom: 10 }}><KpiSummary items={query.data} /></View> : null}
      />
      <KpiForm visible={form} onClose={() => setForm(false)} />
      <HrmFilterSheet visible={filterOpen} onClose={() => setFilterOpen(false)} value={f} onChange={setF} fields={["employee", "period"]} />
    </AdminPage>
  );
}
