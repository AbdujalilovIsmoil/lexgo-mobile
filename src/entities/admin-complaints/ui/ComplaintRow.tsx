import { RowCard, StatusPill } from "@/shared/ui/admin";
import { fmtDate, humanizeSlug } from "@/shared/lib/format";
import { useT } from "@/shared/i18n";
import type { Complaint } from "../model/types";

// One complaint: subject, who it is about (category), work id and date; the backend status as a pill.
export function ComplaintRow({ item, onPress }: { item: Complaint; onPress: () => void }) {
  const { locale } = useT();
  return (
    <RowCard
      icon="alert-triangle" tint={item.priority === "high" ? "#EF4444" : "#F59E0B"} title={item.title || item.workId}
      subtitle={[humanizeSlug(item.category), item.workId].filter(Boolean).join(" · ")} meta={fmtDate(item.createdAt, locale)}
      right={<StatusPill status={item.status} />} onPress={onPress}
    />
  );
}
