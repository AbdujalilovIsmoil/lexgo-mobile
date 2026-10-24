import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { isFinished, useCompleteChat, useRevealActions, useRoom, useRoomCall, useRoomMenu, useRoomMessages, useRoomSettings, useSendMessage } from "@/features/secure-chat";
import { otherMembers, roomTitle } from "@/entities/secure-chat";
import { useChatSheets } from "@/widgets/secure-chat";
import { useSession } from "@/entities/session";
import { useT } from "@/shared/i18n";

// Everything one chat-room screen needs, wired together: the room, its history + socket, sending, the call buttons,
// the "…" menu and the drawers it opens. `join` opens a running call at once; `doc` turns on the client's call button.
export function useChatRoom(id: string, join?: string, doc?: string) {
  const { t } = useT();
  const router = useRouter();
  const myId = useSession()?.user.id ?? "";
  const { room, loading, error } = useRoom(id);
  const title = room ? roomTitle(room, myId) || t("admChat.room") : "";
  const thread = useRoomMessages(id, myId);
  const sh = useChatSheets();
  const [forced, setForced] = useState(false);
  const closed = forced || isFinished(room, thread.all);
  const send = useSendMessage(id, myId, thread, sh.reply, () => sh.setReply(null), () => setForced(true));
  const reveal = useRevealActions(id, thread.reload);
  const settings = useRoomSettings(id);
  const complete = useCompleteChat(id, room, () => { setForced(true); sh.setSheet(""); });
  const invite = room ? otherMembers(room, myId).map((m) => m.userId).filter((u) => u && u !== myId) : [];
  const call = useRoomCall(id, title, doc ?? "", invite);
  const actions = useRoomMenu(room, { myId, onMembers: () => sh.setSheet("members"), onTtl: () => sh.setSheet("ttl"), onComplete: () => sh.setSheet("complete"), askDelete: settings.askDelete });
  useEffect(() => {
    if (!join) return;
    call.open(join);
    router.setParams({ join: "" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [join]);
  return { myId, room, loading, error, title, thread, sh, closed, send, reveal, settings, complete, call, actions };
}
