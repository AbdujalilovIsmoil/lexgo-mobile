import { Pill } from "@/shared/ui";
import { CcAction, CcTicket } from "@/shared/ui/cc";
import { isFinal, isOpen, useCcLabel, useRegionLabel, type UrgentRequest } from "@/entities/admin-callcenter";
import { useT } from "@/shared/i18n";

type Props = { item: UrgentRequest; busy: boolean; canClaim: boolean; onClaim: () => void; onMeet: () => void; onChat: () => void; onOpen: () => void };
const ICON = { video_consultation: "video", express_video_consultation: "zap", traffic_accident_consultation: "alert-triangle", chat_consultation: "message-circle", second_opinion_single: "user-check", second_opinion_group: "users" } as const;
const TINT: Record<string, string> = { open_pool: "#3B82F6", completed: "#22C55E", cancelled: "#8A99AC" };

// A Tezkor Advokat request as a ticket: status badge, a few chips, claim / meeting / chat as round buttons.
export function UrgentTicket({ item, busy, canClaim, onClaim, onMeet, onChat, onOpen }: Props) {
  const { t } = useT();
  const label = useCcLabel();
  const region = useRegionLabel();
  const st = item.status || "open_pool";
  const live = !isOpen(item) && !isFinal(item);
  return (
    <CcTicket
      tint={item.slaBreached ? "#EF4444" : TINT[st] ?? "#8B5CF6"} icon={ICON[item.serviceKind as keyof typeof ICON] ?? "briefcase"} onPress={onOpen}
      title={label("admCc.kind", item.serviceKind) || item.serviceTitle} subtitle={[item.clientName, region(item.region)].filter(Boolean).join(" · ")}
      badge={<Pill small tone={st === "open_pool" ? "blue" : st === "completed" ? "ok" : st === "cancelled" ? "gray" : "cy"} label={label("admCc.stat", st)} />}
      chips={<>
        {item.channel ? <Pill small tone="gray" icon={item.channel === "chat" ? "message-circle" : "video"} label={label("admCc.ch", item.channel)} /> : null}
        {item.immediateCall ? <Pill small tone="warn" icon="zap" label={t("admCc.onDuty")} /> : null}
        {item.slaBreached ? <Pill small tone="err" icon="clock" label={t("admCc.sla")} /> : null}
      </>}
      actions={<>
        {live && item.channel !== "chat" ? <CcAction icon="video" label={t("admCc.startMeeting")} loading={busy} onPress={onMeet} /> : null}
        {item.roomId ? <CcAction icon="message-circle" label={t("admCc.openChat")} onPress={onChat} /> : null}
        {canClaim ? <CcAction primary icon="check" label={t("admCc.claim")} loading={busy} onPress={onClaim} /> : null}
      </>}
    />
  );
}
