import { Pill } from "@/shared/ui";
import { CcAction, CcTicket } from "@/shared/ui/cc";
import { useCcLabel, useRegionLabel, type QueueItem } from "@/entities/admin-callcenter";
import { useT } from "@/shared/i18n";
import { useCompact } from "./useCompact";

type Props = { item: QueueItem; busy: boolean; onAssign: () => void; onMove: () => void; onUrgent: () => void };
const ICON = { order: "shopping-bag", lead: "user-plus", urgent_advokat: "zap" } as const;

// A queue entry as a ticket: red strip + overdue time when the SLA is breached, one round action by type.
export function QueueTicket({ item, busy, onAssign, onMove, onUrgent }: Props) {
  const { t } = useT();
  const label = useCcLabel();
  const region = useRegionLabel();
  const compact = useCompact();
  const urgent = item.type === "urgent_advokat";
  const hot = item.score === "hot" || item.urgency === "urgent";
  const title = urgent ? label("admCc.kind", item.serviceKind) || item.title : item.type === "lead" ? label("admCc.cat", item.title) : item.title;
  const left = item.slaMinutes - item.ageMinutes;
  const act = urgent ? { icon: "arrow-right", label: t("admCc.openUrgent"), on: onUrgent } : item.type === "order" ? { icon: "send", label: t("admCc.assignNext"), on: onAssign } : { icon: "git-merge", label: t("admCc.moveStage"), on: onMove };
  return (
    <CcTicket
      tint={item.slaBreached ? "#EF4444" : urgent ? "#8B5CF6" : "#3B82F6"} icon={ICON[item.type as keyof typeof ICON] ?? "inbox"}
      title={title || "—"} subtitle={[label("admCc.qType", item.type), region(item.region)].filter(Boolean).join(" · ")}
      badge={<Pill small tone={item.slaBreached ? "err" : "ok"} icon="clock" label={item.slaBreached ? `−${compact(-left)}` : compact(left)} />}
      chips={<>{hot ? <Pill small tone="err" icon="alert-circle" label={t("admCc.hot")} /> : null}{item.sellerLoad != null ? <Pill small tone="gray" icon="users" label={String(item.sellerLoad)} /> : null}</>}
      actions={<CcAction primary icon={act.icon as "send"} label={act.label} loading={busy} onPress={act.on} />}
    />
  );
}
