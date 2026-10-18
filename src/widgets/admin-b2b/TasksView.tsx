import { useB2bTasks } from "@/entities/admin-b2b";
import { PagedList, RowCard, StatusPill } from "@/shared/ui/admin";
import { fmtDate } from "@/shared/lib/format";
import { useT } from "@/shared/i18n";

// Work items of the corporate clients (GET /b2b/tasks).
export function TasksView() {
  const { t, locale } = useT();
  const q = useB2bTasks();
  return (
    <PagedList
      data={q.data ?? []} query={q} keyExtractor={(x) => x.id} empty={{ icon: "check-square", title: t("admB2bB.noTasks") }}
      renderItem={(x) => <RowCard icon="check-square" title={x.title} meta={fmtDate(x.due, locale)} right={<StatusPill status={x.status} />} />}
    />
  );
}
