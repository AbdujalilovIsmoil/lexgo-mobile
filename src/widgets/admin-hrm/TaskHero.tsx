import { TASK_STATUSES, isOverdue, statusColor, stLabel, type Task } from "@/entities/admin-hrm";
import { CcHero } from "@/shared/ui/cc";
import { useT } from "@/shared/i18n";

// Execution card: total, running, overdue (red) and done tasks, then the whole board as one stacked bar by status.
export function TaskHero({ all }: { all: Task[] }) {
  const { t } = useT();
  const n = (st: string) => all.filter((x) => x.status === st).length;
  const late = all.filter(isOverdue).length;
  return (
    <CcHero
      stats={[
        { value: String(all.length), label: t("admHrmU.taskN") }, { value: String(n("in_progress") + n("accepted")), label: t("admHrmU.inWork"), color: "#3B82F6" },
        { value: String(late), label: t("admHrmU.overdueN"), color: late ? "#EF4444" : undefined }, { value: String(n("done")), label: t("admHrmU.doneN"), color: "#22C55E" },
      ]}
      segments={TASK_STATUSES.map((s) => ({ key: s, value: n(s), color: statusColor(s), label: `${stLabel(t, s)} ${n(s)}` }))}
    />
  );
}
