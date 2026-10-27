import { useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import { Button, Chip, EmptyState, IconButton } from "@/shared/ui";
import { AdminPage, PagedList, SearchBox } from "@/shared/ui/admin";
import { EMPTY_FILTER, useMoveTask, useTaskLive, useTaskMeta, useTeamTask, useTeamTasks, type TaskFilter, type TeamTask } from "@/entities/team-tasks";
import { useAccess } from "@/entities/access";
import { TaskFormSheet } from "@/features/team-task-form";
import { StatusBar, TaskDetailSheet, TaskFilterSheet, TaskKpis, TaskRow, filterCount } from "@/widgets/team-tasks";
import { useDebounced } from "@/shared/lib/useDebounced";
import { fmtDate } from "@/shared/lib/format";
import { todayKey } from "@/shared/lib/pro/dates";
import { useT } from "@/shared/i18n";

function Tasks() {
  const { t, locale } = useT();
  const meta = useTaskMeta().data;
  const [f, setF] = useState<TaskFilter>(EMPTY_FILTER);
  const [q, setQ] = useState("");
  const dq = useDebounced(q, 300);
  const [filters, setFilters] = useState(false);
  const [picked, setOpen] = useState<TeamTask | null>(null);
  // A task alert (push tap) opens its detail: /team-tasks?task=<id>. Closing the sheet drops it for this visit.
  const linked = String(useLocalSearchParams<{ task?: string }>().task ?? "");
  const [dismissed, setDismissed] = useState("");
  const fromLink = useTeamTask(linked && linked !== dismissed ? linked : "").data ?? null;
  const open = picked ?? fromLink;
  const [creating, setCreating] = useState(false);
  const move = useMoveTask();
  useTaskLive();
  const filter: TaskFilter = { ...f, q: dq.trim() };
  const { items, counts, query } = useTeamTasks(filter);
  const active = filterCount(f);
  const who = f.assignee === "me" ? t("ttm.filter.me") : f.assignee === "unassigned" ? t("ttm.filter.unassigned") : f.assignee ? t("ttm.filter.assignee") : "";
  const range = f.from ? `${t(`ttm.filter.field.${f.field}`)}: ${fmtDate(`${f.from}T12:00:00`, locale)}${f.to && f.to !== f.from ? ` – ${fmtDate(`${f.to}T12:00:00`, locale)}` : ""}` : "";
  // A KPI card opens exactly its tasks: today's, by its own period field, with nothing else narrowing the list.
  const openKpi = (field: TaskFilter["field"]) => {
    const day = todayKey();
    setQ("");
    setF({ ...EMPTY_FILTER, field, from: day, to: day });
  };
  const filtered = !!(f.status || active || dq.trim());
  return (
    <AdminPage title={t("ttm.title")} subtitle={t("ttm.lead")} right={meta?.canCreate ? <IconButton icon="plus" label={t("ttm.create")} onPress={() => setCreating(true)} /> : undefined}>
      <PagedList
        data={items}
        query={query}
        keyExtractor={(x) => x.id}
        skeletonHeight={130}
        renderItem={(x) => <TaskRow item={x} busy={move.isPending && move.variables?.task.id === x.id} onOpen={() => setOpen(x)} onMove={(to) => move.mutate({ task: x, to })} />}
        empty={{ icon: "check-square", title: filtered ? t("ttm.emptyFiltered") : t("ttm.empty"), text: filtered ? undefined : t("ttm.lead") }}
        header={
          <View style={{ gap: 12, paddingBottom: 10 }}>
            <TaskKpis onOpen={openKpi} />
            <View style={{ flexDirection: "row", alignItems: "center", marginHorizontal: -16 }}>
              <View style={{ flex: 1 }}><SearchBox value={q} onChangeText={setQ} placeholder={t("ttm.filter.search")} /></View>
              <View style={{ paddingRight: 16 }}><IconButton icon="sliders" label={t("ttm.filter.title")} badge={active > 0} onPress={() => setFilters(true)} /></View>
            </View>
            <StatusBar value={f.status} onChange={(status) => setF({ ...f, status })} counts={counts} />
            {active ? (
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {f.assignee ? <Chip label={who} active icon="x" onPress={() => setF({ ...f, assignee: "" })} /> : null}
                {range ? <Chip label={range} active icon="x" onPress={() => setF({ ...f, from: "", to: "" })} /> : null}
                <Button title={t("ttm.clearFilters")} variant="ghost" size="sm" onPress={() => setF(EMPTY_FILTER)} />
              </View>
            ) : null}
          </View>
        }
      />
      <TaskDetailSheet item={open} canAssign={!!meta?.canAssign} onClose={() => { setOpen(null); setDismissed(linked); }} />
      <TaskFormSheet visible={creating} onClose={() => setCreating(false)} task={null} canAssign={!!meta?.canAssign} />
      <TaskFilterSheet visible={filters} onClose={() => setFilters(false)} value={f} onApply={setF} />
    </AdminPage>
  );
}

// "Jamoa vazifalari": every task of the team, for anyone with tasks.view. What each person may do comes from the server's `actions`
// on every task (never from their role); the list follows the socket's task events.
export default function TeamTasksPage() {
  const { t } = useT();
  const allowed = useAccess().can("tasks.view");
  if (!allowed) return <AdminPage title={t("ttm.title")}><EmptyState icon="lock" title={t("ttm.denied")} /></AdminPage>;
  return <Tasks />;
}
