import { ActionList, OptionSheet, type ActionItem } from "@/shared/ui/admin";
import { FilePreview } from "@/shared/ui/preview";
import type { Room } from "@/entities/secure-chat";
import { CompleteSheet, TTL_OPTIONS, type useCompleteChat, type useRoomSettings } from "@/features/secure-chat";
import { useT } from "@/shared/i18n";
import { MembersSheet } from "./MembersSheet";
import { MessageMenu } from "./MessageMenu";
import type { SheetState } from "./useChatSheets";

type Props = { sh: SheetState; room: Room | undefined; myId: string; actions: ActionItem[]; settings: ReturnType<typeof useRoomSettings>; complete: ReturnType<typeof useCompleteChat>; onRetry: (id: string) => void; onDiscard: (id: string) => void };

// Every drawer and viewer of a chat room, driven by `useChatSheets`.
export function ChatSheets({ sh, room, myId, actions, settings, complete, onRetry, onDiscard }: Props) {
  const { t } = useT();
  const close = () => sh.setSheet("");
  return (
    <>
      <MessageMenu msg={sh.target} onClose={() => sh.setTarget(null)} onReply={sh.setReply} onRetry={onRetry} onDiscard={onDiscard} />
      <ActionList visible={sh.sheet === "menu"} onClose={close} title={t("admChat.settings")} actions={actions} />
      <MembersSheet visible={sh.sheet === "members"} onClose={close} room={room} myId={myId} />
      <OptionSheet visible={sh.sheet === "ttl"} onClose={close} title={t("admChatB.ttl")} value={String(room?.ttlHours ?? 0)} options={TTL_OPTIONS.map((h) => ({ value: String(h), label: t(`admChatB.ttlOpt.${h}`) }))} onPick={(v) => settings.ttl.mutate(Number(v))} />
      <CompleteSheet visible={sh.sheet === "complete"} onClose={close} action={complete} />
      <FilePreview visible={!!sh.file} onClose={() => sh.setFile(null)} file={sh.file} />
    </>
  );
}
