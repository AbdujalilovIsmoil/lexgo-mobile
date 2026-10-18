import { useState } from "react";
import { useRouter } from "expo-router";
import { TaskRow, useTaskStatus, type ProTask } from "@/entities/pro-tasks";
import { TaskFormSheet } from "@/features/pro-task-form";
import { useT } from "@/shared/i18n";
import { useKept } from "@/shared/lib/useKept";
import { Text } from "@/shared/ui";
import { SectionCard } from "@/shared/ui/admin";

// The three most urgent open tasks (overdue first); tick to complete, tap to edit.
export function TasksBlock({ tasks }: { tasks: ProTask[] }) {
  const { t } = useT();
  const router = useRouter();
  const move = useTaskStatus();
  const [sel, setSel] = useState<ProTask | null>(null);
  const [open, setOpen] = useState(false);
  const kept = useKept(sel);
  return (
    <SectionCard title={t("aw1.tk.title")} action={{ label: t("aw1.all"), onPress: () => router.push("/pro/tasks" as never) }}>
      {tasks.length ? tasks.slice(0, 3).map((x) => <TaskRow key={x.id} task={x} onPress={() => { setSel(x); setOpen(true); }} onToggle={() => move.mutate({ id: x.id, status: "done" })} />) : <Text variant="small" tone="gray">{t("aw1.tk.empty")}</Text>}
      <TaskFormSheet visible={open} onClose={() => setOpen(false)} task={kept} />
    </SectionCard>
  );
}
