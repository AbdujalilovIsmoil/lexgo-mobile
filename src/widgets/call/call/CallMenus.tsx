import { ActionList, type ActionItem } from "@/shared/ui/admin";
import type { Call } from "@/entities/call";
import type { Recording } from "@/features/call";
import { useT } from "@/shared/i18n";
import type { StageMode } from "./CallStage";

type Fn = () => void;
type MoreProps = { visible: boolean; onClose: Fn; call: Call | null; unread: number; video: boolean; mode: StageMode; rec: Recording; canTransfer: boolean; onChat: Fn; onPeople: Fn; onMode: Fn; onPause: Fn; onFree: Fn; onPaid: Fn; onTransfer: Fn };

// "More" drawer of the call screen. Hold / extend / transfer are host-only; the free extension shows only while the
// server offers it; recording follows the consent rules (the client asks, the host allows and starts).
export function MoreMenu({ visible, onClose, call, unread, video, mode, rec, canTransfer, onChat, onPeople, onMode, onPause, onFree, onPaid, onTransfer }: MoreProps) {
  const { t } = useT();
  const host = !!call?.perms.canEnd;
  const limited = !!call && call.maxMinutes > 0;
  const actions: ActionItem[] = [
    { key: "chat", icon: "message-circle", label: unread ? `${t("admMeet.chat")} (${unread})` : t("admMeet.chat"), onPress: onChat },
    { key: "people", icon: "users", label: t("admMeetB.people"), onPress: onPeople },
    ...(video ? [{ key: "mode", icon: (mode === "grid" ? "user" : "grid") as "user" | "grid", label: mode === "grid" ? t("admMeetB.speakerView") : t("admMeetB.gridView"), onPress: onMode }] : []),
    ...(host ? [{ key: "pause", icon: (call?.paused ? "play" : "pause") as "play" | "pause", label: call?.paused ? t("admMeetB.resume") : t("admMeetB.pause"), onPress: onPause }] : []),
    ...(host && limited && call?.freeAvailable ? [{ key: "free", icon: "plus-circle" as const, label: t("admMeetB.extendFree", { n: call.freeMax }), onPress: onFree }] : []),
    ...(host && limited ? [{ key: "paid", icon: "clock" as const, label: t("admMeetB.extendPaid"), onPress: onPaid }] : []),
    ...(rec.canAsk ? [{ key: "rec", icon: "disc" as const, label: t("ms6.recAsk2"), onPress: () => rec.request.mutate() }] : []),
    ...(rec.canStart ? [{ key: "recstart", icon: "disc" as const, label: t("ms6.recStart"), onPress: () => rec.start.mutate() }] : []),
    ...(canTransfer ? [{ key: "transfer", icon: "repeat" as const, label: t("ms6.transfer"), onPress: onTransfer }] : []),
  ];
  return <ActionList visible={visible} onClose={onClose} title={t("admMeetB.more")} actions={actions} />;
}

// Hang-up drawer: leave (the meeting goes on) or, for the host, end it for everybody.
export function EndMenu({ visible, onClose, canEnd, onLeave, onEnd }: { visible: boolean; onClose: () => void; canEnd: boolean; onLeave: () => void; onEnd: () => void }) {
  const { t } = useT();
  const actions: ActionItem[] = [{ key: "leave", icon: "log-out", label: t("admMeetB.leave"), onPress: onLeave }, ...(canEnd ? [{ key: "end", icon: "phone-off" as const, label: t("admMeet.endAll"), danger: true, onPress: onEnd }] : [])];
  return <ActionList visible={visible} onClose={onClose} title={t("admMeetB.hangUp")} actions={actions} />;
}
