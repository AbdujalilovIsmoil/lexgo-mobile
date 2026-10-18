import { useState } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { EmployeeRow, chatHref, useEmployees, useLive, useLocalPaged, useNames, type Employee } from "@/entities/admin-hrm";
import { AssignmentForm, EmployeeForm } from "@/features/admin-hrm";
import { EmployeeSheet, EmployeesHero, HrmFilterSheet, NO_FILTERS, countFilters } from "@/widgets/admin-hrm";
import { AdminPage, PagedList, SearchBox } from "@/shared/ui/admin";
import { IconButton } from "@/shared/ui";
import { CcTiles } from "@/shared/ui/cc";
import { useDebounced } from "@/shared/lib/useDebounced";
import { useT } from "@/shared/i18n";

const later = (fn: () => void) => setTimeout(fn, 320);

// Employees (internal_hr.manage): search, status and unit filters, 360 view, create, edit and assign.
export default function EmployeesPage() {
  const { t } = useT();
  const names = useNames();
  const router = useRouter();
  const chat = (e: Employee) => { setSel(null); setTimeout(() => router.push(chatHref(e.userId, e.name) as never), 320); };
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [filters, setFilters] = useState(NO_FILTERS);
  const [sel, setSel] = useState<Employee | null>(null);
  const [edit, setEdit] = useState<Employee | null>(null);
  const [form, setForm] = useState(false);
  const [assign, setAssign] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [rev, setRev] = useState(0);
  useLive();
  const query = useEmployees();
  const needle = useDebounced(q.trim().toLowerCase());
  const all = query.data ?? [];
  const shown = all.filter((e) => (!status || e.status === status) && (!filters.positionId || e.assignment?.positionId === filters.positionId) && (!filters.unitId || e.assignment?.unitId === filters.unitId) && (!needle || `${e.name} ${e.code} ${e.phone} ${e.email}`.toLowerCase().includes(needle)));
  const { items, query: paged } = useLocalPaged(query, shown);
  const place = (e: Employee) => [e.assignment ? names.position(e.assignment.positionId) : "", e.assignment ? names.unit(e.assignment.unitId) : ""].filter(Boolean).join(" · ");
  const open = (e: Employee | null, kind: "form" | "assign") => { setSel(null); later(() => { setEdit(e); setRev((n) => n + 1); if (kind === "form") setForm(true); else setAssign(true); }); };
  const count = (st: string) => all.filter((e) => !st || e.status === st).length;
  const options = [{ value: "", label: t("adm.all"), count: count("") }, { value: "active", label: t("adm.active"), count: count("active") }, { value: "inactive", label: t("adm.inactive"), count: count("inactive") }];
  return (
    <AdminPage
      title={t("admHrm.nav.employees")} subtitle={t("admHrmB.total", { n: shown.length })}
      right={<><IconButton icon="filter" badge={countFilters(filters) > 0} onPress={() => setFilterOpen(true)} /><IconButton icon="user-plus" onPress={() => open(null, "form")} /></>}
    >
      <PagedList
        data={items} query={paged} keyExtractor={(e) => e.id} renderItem={(e, i) => <EmployeeRow index={i} item={e} place={place(e)} onPress={() => setSel(e)} onMessage={chat} />}
        empty={{ icon: "users", title: t("admHrmB.noEmployees") }} off={{ title: t("admHrmC.offTitle"), text: t("admHrmC.offText") }}
        header={<View style={{ gap: 10, marginBottom: 10 }}><EmployeesHero all={all} /><View style={{ gap: 8, marginHorizontal: -16 }}><SearchBox value={q} onChangeText={setQ} placeholder={t("admHrmB.searchEmployees")} /><CcTiles options={options} value={status} onChange={setStatus} /></View></View>}
      />
      <EmployeeSheet employee={sel} onClose={() => setSel(null)} onEdit={(e) => open(e, "form")} onAssign={(e) => open(e, "assign")} onMessage={chat} />
      <EmployeeForm key={`f-${rev}`} visible={form} onClose={() => setForm(false)} employee={edit} />
      {edit ? <AssignmentForm key={`a-${rev}`} visible={assign} onClose={() => setAssign(false)} employee={edit} /> : null}
      <HrmFilterSheet visible={filterOpen} onClose={() => setFilterOpen(false)} value={filters} onChange={setFilters} fields={["unit", "position"]} />
    </AdminPage>
  );
}
