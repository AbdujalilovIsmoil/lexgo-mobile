import { RowCard, StatusPill } from "@/shared/ui/admin";
import { fmtDate } from "@/shared/lib/format";
import { useT } from "@/shared/i18n";
import type { AdminTask } from "../model/types";

const TINT: Record<string, string> = { high: "#EF4444", medium: "#F59E0B", low: "#22C55E" };

// One task: title, who it belongs to, the case and the due date; the backend status as a pill.
export function AdminTaskRow({ item, who, onPress }: { item: AdminTask; who: string; onPress: () => void }) {
  const { locale } = useT();
  const done = item.checklist.filter((c) => c.done).length;
  return (
    <RowCard
      icon="check-square" tint={TINT[item.priority] ?? "#3B82F6"} title={item.title}
      subtitle={[who, item.caseTitle].filter(Boolean).join(" · ")} meta={[fmtDate(item.due, locale), item.checklist.length ? `${done}/${item.checklist.length}` : ""].filter(Boolean).join(" · ")}
      right={<StatusPill status={item.status} />} onPress={onPress}
    />
  );
}
