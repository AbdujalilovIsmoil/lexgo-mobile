import { Pill, Text } from "@/shared/ui";
import { CcTicket } from "@/shared/ui/cc";
import { ctorMeta, useStudioText, type StudioActivity } from "@/entities/admin-studio";
import { timeAgo } from "@/shared/lib/format";
import { useColors } from "@/shared/theme";
import { LiveTime } from "./LiveTime";

// One editing session as a ticket (green strip while online): who, constructor / object, role, saves, when last seen, duration.
export function SessionRow({ a, loadedAt, onOpen }: { a: StudioActivity; loadedAt: number; onOpen?: () => void }) {
  const { t, ctorName, role, duration } = useStudioText();
  const c = useColors();
  return (
    <CcTicket
      tint={a.online ? c.ok : c.gray}
      avatar={a.userName || t("admStudioC.mon.unknown")}
      title={a.userName || t("admStudioC.mon.unknown")}
      subtitle={`${a.code ? ctorName(a.code) : "—"} · ${a.objectName || t("admStudioC.mon.noObject")}`}
      badge={a.online ? <LiveTime base={a.durationSec} loadedAt={loadedAt} /> : <Text variant="small" tone="gray">{duration(a.durationSec)}</Text>}
      chips={<>
        <Pill label={a.online ? t("admStudioC.mon.onlineNow") : t("admStudioC.mon.offline")} tone={a.online ? "ok" : "gray"} icon={ctorMeta(a.code).icon} small />
        {a.role ? <Pill small tone="gray" label={role(a.role)} /> : null}
        <Pill small tone="gray" icon="save" label={t("admStudioC.mon.savesN", { n: a.saves })} />
        {a.online ? null : <Pill small tone="gray" icon="clock" label={timeAgo(a.endedAt || a.lastSeenAt, t)} />}
      </>}
      onPress={a.objectId ? onOpen : undefined}
    />
  );
}
