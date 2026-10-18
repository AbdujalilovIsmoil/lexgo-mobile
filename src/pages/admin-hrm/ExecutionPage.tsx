import { useState } from "react";
import { View } from "react-native";
import { TASK_STATUSES, TaskRow, hrmKeys, stLabel, useInternalChannel, useLive, useLocalPaged, useTasks, type Task } from "@/entities/admin-hrm";
import { TaskForm } from "@/features/admin-hrm";
import { HrmFilterSheet, NO_FILTERS, TaskHero, TaskSheet, countFilters } from "@/widgets/admin-hrm";
import { AdminPage, PagedList, SearchBox, isDate } from "@/shared/ui/admin";
import { IconButton } from "@/shared/ui";
import { CcTiles } from "@/shared/ui/cc";
import { useQueryClient } from "@tanstack/react-query";
import { useDebounced } from "@/shared/lib/useDebounced";
import { useT } from "@/shared/i18n";

// Execution (internal_execution.manage): every work item with search, status, project, assignee and date filters;
// create tasks, change status, comment.
export default function ExecutionPage() {
  const { t } = useT();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [f, setF] = useState(NO_FILTERS);
  const [filterOpen, setFilterOpen] = useState(false);
  const [form, setForm] = useState(false);
  const [open, setOpen] = useState<Task | null>(null);
  const qc = useQueryClient();
  useLive();
  // The open task has its own channel: comments and status changes from others refresh the list at once.
  useInternalChannel(open ? `task:${open.id}` : "", () => void qc.refetchQueries({ queryKey: hrmKeys.all, type: "active" }));
  const query = useTasks({
    q: useDebounced(q.trim()), project: useDebounced(f.project.trim()), responsible_employee_id: f.employeeId,
    date_from: isDate(f.from) ? f.from : "", date_to: isDate(f.to) ? f.to : "",
  });
  const all = query.data ?? [];
  const shown = status ? all.filter((x) => x.status === status) : all;
  const { items, query: paged } = useLocalPaged(query, shown);
  const count = (st: string) => all.filter((x) => x.status === st).length;
  const options = [{ value: "", label: t("adm.all"), count: all.length }, ...TASK_STATUSES.map((s) => ({ value: s as string, label: stLabel(t, s), count: count(s) }))];
  return (
    <AdminPage
      title={t("admHrm.nav.execution")} subtitle={t("admHrmB.total", { n: shown.length })}
      right={<><IconButton icon="filter" badge={countFilters(f) > 0} onPress={() => setFilterOpen(true)} /><IconButton icon="plus" onPress={() => setForm(true)} /></>}
    >
      <PagedList
        data={items} query={paged} keyExtractor={(x) => x.id} renderItem={(x, i) => <TaskRow index={i} item={x} onPress={() => setOpen(x)} />} empty={{ icon: "briefcase", title: t("admHrmC.noTasks") }} off={{ title: t("admHrmC.offTitle"), text: t("admHrmC.offText") }}
        header={<View style={{ gap: 10, marginBottom: 10 }}><TaskHero all={all} /><View style={{ gap: 8, marginHorizontal: -16 }}><SearchBox value={q} onChangeText={setQ} placeholder={t("admHrm.searchTasks")} /><CcTiles options={options} value={status} onChange={setStatus} /></View></View>}
      />
      <TaskSheet item={open} canManage onClose={() => setOpen(null)} />
      <TaskForm visible={form} onClose={() => setForm(false)} />
      <HrmFilterSheet visible={filterOpen} onClose={() => setFilterOpen(false)} value={f} onChange={setF} fields={["employee", "project", "dates"]} />
    </AdminPage>
  );
}
