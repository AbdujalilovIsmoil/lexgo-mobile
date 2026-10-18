import { useState } from "react";
import { TaskFormSheet } from "@/features/pro-task-form";
import type { ProTask } from "@/entities/pro-tasks";
import { useT } from "@/shared/i18n";
import { useKept } from "@/shared/lib/useKept";
import { IconButton } from "@/shared/ui";
import { AdminPage } from "@/shared/ui/admin";
import { TaskList } from "@/widgets/pro-task-list";

// /pro/tasks — the professional's personal task list with a bottom-sheet editor.
export default function ProTasksPage() {
  const { t } = useT();
  const [sheet, setSheet] = useState<{ task: ProTask | null } | null>(null);
  const kept = useKept(sheet);
  return (
    <AdminPage title={t("aw7.title")} subtitle={t("aw7.sub")} right={<IconButton icon="plus" onPress={() => setSheet({ task: null })} />}>
      <TaskList onOpen={(task) => setSheet({ task })} />
      <TaskFormSheet visible={!!sheet} onClose={() => setSheet(null)} task={kept?.task ?? null} />
    </AdminPage>
  );
}
