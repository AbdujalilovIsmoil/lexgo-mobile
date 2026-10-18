import { Pill } from "@/shared/ui";
import { CcAction, CcTicket } from "@/shared/ui/cc";
import { csLabel, isLive, type Invited } from "@/entities/call";
import { fmtTime } from "@/shared/lib/format";
import { useT } from "@/shared/i18n";

const OUT = ["removed", "declined"];

// A meeting as a ticket (the day and start time are on the timeline rail beside it): green strip + round Join button while it is live, grey once it is over.
export function MeetingTicket({ item, myId, onOpen, onJoin }: { item: Invited; myId: string; onOpen: () => void; onJoin: () => void }) {
  const { t } = useT();
  const live = isLive(item.callStatus);
  const mine = item.callerId === myId;
  const canJoin = live && !OUT.includes(item.status);
  const until = live && item.autoEndAt ? ` · ${t("ms7.until", { time: fmtTime(item.autoEndAt) })}` : "";
  return (
    <CcTicket
      tint={live ? "#22C55E" : "#8A99AC"} icon={item.type === "audio" ? "phone" : "video"} onPress={onOpen}
      title={item.title || t("admMeet.untitled")}
      subtitle={`${mine ? t("admMeet.hostedByYou") : t("admMeet.hostedBy", { name: item.callerName || t("admMeet.someone") })}${until}`}
      badge={<Pill small tone={live ? "ok" : "gray"} icon={live ? "radio" : undefined} label={live ? t("ms7.live") : csLabel(t, item.callStatus)} />}
      actions={canJoin ? <CcAction primary icon={item.type === "audio" ? "phone" : "video"} label={t(mine || item.status === "joined" ? "admMeet.rejoin" : "admMeet.join")} onPress={onJoin} /> : undefined}
    />
  );
}
