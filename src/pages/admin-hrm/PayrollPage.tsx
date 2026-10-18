import { useState } from "react";
import { View } from "react-native";
import { PayrollRow, useLocalPaged, useNames, usePayroll } from "@/entities/admin-hrm";
import { PayrollForm } from "@/features/admin-hrm";
import { HrmFilterSheet, NO_FILTERS, PayrollSummaryCard, PayrollTiles, countFilters } from "@/widgets/admin-hrm";
import { AdminPage, PagedList } from "@/shared/ui/admin";
import { IconButton } from "@/shared/ui";
import { useScreenGuard } from "@/shared/guard";
import { useT } from "@/shared/i18n";

// Payroll (internal_payroll.manage, screen-capture blocked): the month's total and split by entry type, the entries, and new draft entries.
export default function PayrollPage() {
  const { t } = useT();
  useScreenGuard(); // salary data is confidential: no screenshots / recordings
  const names = useNames();
  const [f, setF] = useState(NO_FILTERS);
  const [filterOpen, setFilterOpen] = useState(false);
  const [form, setForm] = useState(false);
  const [status, setStatus] = useState("");
  const query = usePayroll(f.employeeId, f.period);
  const { items, query: paged } = useLocalPaged(query, (query.data ?? []).filter((p) => !status || p.status === status));
  return (
    <AdminPage
      title={t("admHrm.nav.payroll")} subtitle={f.period || t("admHrmB.navDesc.payroll")}
      right={<><IconButton icon="filter" badge={countFilters(f) > 0} onPress={() => setFilterOpen(true)} /><IconButton icon="plus" onPress={() => setForm(true)} /></>}
    >
      <PagedList
        data={items} query={paged} keyExtractor={(p) => p.id} renderItem={(p, i) => <PayrollRow item={p} who={names.employee(p.employeeId)} index={i} />}
        off={{ title: t("admHrmC.offTitle"), text: t("admHrmC.offText") }} empty={{ icon: "credit-card", title: t("admHrmC.noEntries") }} header={<View style={{ gap: 12, marginBottom: 10 }}><PayrollSummaryCard period={f.period} /><View style={{ marginHorizontal: -16 }}><PayrollTiles items={query.data ?? []} value={status} onChange={setStatus} /></View></View>}
      />
      <PayrollForm visible={form} onClose={() => setForm(false)} />
      <HrmFilterSheet visible={filterOpen} onClose={() => setFilterOpen(false)} value={f} onChange={setF} fields={["employee", "period"]} />
    </AdminPage>
  );
}
