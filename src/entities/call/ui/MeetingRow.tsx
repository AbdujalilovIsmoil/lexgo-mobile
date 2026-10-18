import { Button } from "@/shared/ui";
import { RowCard, StatusPill } from "@/shared/ui/admin";
import { fmtDateTime } from "@/shared/lib/format";
import { useT } from "@/shared/i18n";
import { csLabel } from "../lib/csLabel";
import { isLive } from "../model/types";
import type { Invited } from "../model/historyTypes";

const OUT = ["removed", "declined"];

// One meeting I hosted or was invited to; live ones carry a Join / Rejoin button.
export function MeetingRow({ item, myId, onJoin }: { item: Invited; myId: string; onJoin: (m: Invited) => void }) {
  const { t, locale } = useT();
  const live = isLive(item.callStatus);
  const mine = item.callerId === myId;
  const canJoin = live && !OUT.includes(item.status);
  return (
    <RowCard
      icon={item.type === "audio" ? "phone" : "video"}
      tint={live ? "#22C55E" : "#64748B"}
      title={item.title || t("admMeet.untitled")}
      subtitle={mine ? t("admMeet.hostedByYou") : t("admMeet.hostedBy", { name: item.callerName || t("admMeet.someone") })}
      meta={fmtDateTime(item.startedAt, locale)}
      right={<StatusPill status={item.callStatus} label={csLabel(t, item.callStatus)} />}
    >
      {canJoin ? <Button title={mine || item.status === "joined" ? t("admMeet.rejoin") : t("admMeet.join")} icon="video" size="sm" variant="gradient" onPress={() => onJoin(item)} /> : null}
    </RowCard>
  );
}
