import { useCallback, useState } from "react";
import { useAccess } from "@/entities/access";
import { TaskRow, useLive, useTasksPaged, type Task } from "@/entities/admin-hrm";
import { TaskQuick } from "@/features/admin-hrm";
import { TaskSheet, TasksHeader } from "@/widgets/admin-hrm";
import { AdminPage, PagedList } from "@/shared/ui/admin";
import { useDebounced } from "@/shared/lib/useDebounced";
import { useT } from "@/shared/i18n";

// Tasks assigned to me as tickets (hero, search, status tiles, server pages of 25, live refresh); managers get quick start / complete.
export default function MyTasksPage() {
  const { t } = useT();
  const canManage = useAccess().canInternal("internal_execution.manage");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [open, setOpen] = useState<Task | null>(null);
  const { items, query: paged } = useTasksPaged(useDebounced(q.trim()), status);
  const show = useCallback((x: Task) => setOpen(x), []);
  useLive();
  return (
    <AdminPage title={t("admHrm.nav.tasks")} subtitle={t("admHrmB.navDesc.tasks")}>
      <PagedList
        data={items} query={paged} keyExtractor={(x) => x.id} renderItem={(x, i) => <TaskRow index={i} item={x} onPress={() => show(x)} actions={canManage ? <TaskQuick item={x} /> : undefined} />}
        empty={{ icon: "check-square", title: t("admHrm.noTasks") }}
        header={<TasksHeader q={q} onQ={setQ} status={status} onStatus={setStatus} />}
      />
      <TaskSheet item={open} canManage={canManage} onClose={() => setOpen(null)} />
    </AdminPage>
  );
}
