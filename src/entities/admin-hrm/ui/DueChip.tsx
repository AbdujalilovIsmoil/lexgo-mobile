import { Pill } from "@/shared/ui";
import { fmtDate } from "@/shared/lib/format";
import { useT } from "@/shared/i18n";
import { daysOverdue, isOpenTask, isToday } from "../lib/taskDue";

// Deadline chip of a task: red "N days overdue", amber "due today", grey date otherwise.
export function DueChip({ task }: { task: { status: string; deadline: string } }) {
  const { t, locale } = useT();
  if (!task.deadline) return null;
  const late = daysOverdue(task);
  if (late) return <Pill small tone="err" icon="alert-circle" label={t("admHrmW.lateBy", { n: late })} />;
  if (isOpenTask(task) && isToday(task.deadline)) return <Pill small tone="warn" icon="clock" label={t("admHrmW.dueToday")} />;
  return <Pill small tone="gray" icon="calendar" label={fmtDate(task.deadline, locale)} />;
}
