import { useState } from "react";
import { View } from "react-native";
import { AdminTaskRow, useAdminTasks, type AdminTask } from "@/entities/admin-tasks";
import { useUserNames } from "@/entities/admin-users";
import { ExportButton } from "@/features/admin-export";
import { AdminTaskSheet } from "@/widgets/admin-tasks";
import { AdminPage, ChipBar, PagedList, SearchBox } from "@/shared/ui/admin";
import { useLocalPaged } from "@/shared/lib/adm/useLocalPaged";
import { useT } from "@/shared/i18n";

const STATUSES = ["todo", "doing", "review", "done", "deleted"];

// Workspace tasks of all professionals: filter by status (server) and search; open one for its checklist; export to Excel.
export default function AdminTasksPage() {
  const { t } = useT();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [open, setOpen] = useState<AdminTask | null>(null);
  const query = useAdminTasks(status);
  const names = useUserNames().data;
  const who = (id: string) => names?.get(id) ?? "";
  const needle = q.trim().toLowerCase();
  const rows = (query.data ?? []).filter((x) => !needle || `${x.title} ${x.caseTitle}`.toLowerCase().includes(needle));
  const { items, query: paged } = useLocalPaged(query, rows, 25, `${status}|${needle}`);
  const options = [{ value: "", label: t("adm.all") }, ...STATUSES.map((s) => ({ value: s, label: t(`admSt.${s}`) === `admSt.${s}` ? s : t(`admSt.${s}`) }))];
  return (
    <AdminPage title={t("admHub.mod.adminTasks.title")} subtitle={t("ag4.tasks.count", { n: rows.length })} right={<ExportButton id="tasks" />}>
      <PagedList
        data={items} query={paged} keyExtractor={(x) => x.id} renderItem={(x) => <AdminTaskRow item={x} who={who(x.assigneeId)} onPress={() => setOpen(x)} />}
        empty={{ icon: "check-square", title: t("ag4.tasks.empty") }}
        header={<View style={{ gap: 8, marginHorizontal: -16, marginBottom: 10 }}><SearchBox value={q} onChangeText={setQ} placeholder={t("ag4.tasks.search")} /><ChipBar options={options} value={status} onChange={setStatus} /></View>}
      />
      <AdminTaskSheet item={open} who={open ? who(open.assigneeId) : ""} onClose={() => setOpen(null)} />
    </AdminPage>
  );
}
