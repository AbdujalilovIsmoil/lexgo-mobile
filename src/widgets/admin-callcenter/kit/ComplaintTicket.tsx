import { Pill } from "@/shared/ui";
import { CcTicket } from "@/shared/ui/cc";
import { useCcLabel, type Complaint } from "@/entities/admin-callcenter";
import { useT } from "@/shared/i18n";
import { fmtDateTime } from "@/shared/lib/format";

// A quality complaint as a ticket: red while it awaits a ruling, green once closed.
export function ComplaintTicket({ item, onPress }: { item: Complaint; onPress: () => void }) {
  const { t, locale } = useT();
  const label = useCcLabel();
  const open = item.status === "new" || item.status === "under_review";
  return (
    <CcTicket
      tint={open ? "#EF4444" : "#22C55E"} icon="alert-triangle" onPress={onPress}
      title={item.title || t("admCcB.complaintTitle")} subtitle={[item.lawyerName, item.workId].filter(Boolean).join(" · ")}
      badge={<Pill small tone={open ? "err" : "ok"} label={label("admCcB.cStatus", item.status)} />}
      chips={<>{item.hasUrgent ? <Pill small tone="cy" icon="zap" label={t("admCcB.bUrgent")} /> : null}<Pill small tone="gray" icon="clock" label={fmtDateTime(item.createdAt, locale)} /></>}
    />
  );
}
