import { StyleSheet, View } from "react-native";
import { Pill } from "@/shared/ui";
import { RowCard, StatusPill } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";
import { fmtDateTime } from "@/shared/lib/format";
import { useCcLabel } from "../model/labels";
import type { Complaint } from "../model/complaintTypes";

// One quality complaint in the queue: work, advocate, age and where the ruling stands.
export function ComplaintItem({ item, onPress }: { item: Complaint; onPress: () => void }) {
  const { t, locale } = useT();
  const label = useCcLabel();
  const open = item.status === "new" || item.status === "under_review";
  return (
    <RowCard
      icon="alert-triangle"
      tint={open ? "#EF4444" : "#22C55E"}
      title={item.title || t("admCcB.complaintTitle")}
      subtitle={[item.workId, item.lawyerName].filter(Boolean).join(" · ")}
      meta={fmtDateTime(item.createdAt, locale)}
      right={<StatusPill status={item.status} label={label("admCcB.cStatus", item.status)} />}
      onPress={onPress}
    >
      {item.hasUrgent ? <View style={s.row}><Pill small tone="cy" icon="zap" label={t("admCcB.bUrgent")} /></View> : null}
    </RowCard>
  );
}

const s = StyleSheet.create({ row: { flexDirection: "row", gap: 6 } });
