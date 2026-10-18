import { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { KeyboardLift } from "@/shared/ui/admin";
import type { Room } from "@/entities/secure-chat";
import { useRoomCalls, isLive } from "@/entities/call";
import { Composer, type useRevealActions, type useRoomMessages, type useSendMessage } from "@/features/secure-chat";
import { useT } from "@/shared/i18n";
import { ActiveCallBar } from "./ActiveCallBar";
import { ChatThread } from "./ChatThread";
import { RevealBanner } from "./RevealBanner";
import type { SheetState } from "./useChatSheets";

type Props = { roomId: string; room: Room | undefined; myId: string; staff: boolean; closed: boolean; thread: ReturnType<typeof useRoomMessages>; send: ReturnType<typeof useSendMessage>; reveal: ReturnType<typeof useRevealActions>; sh: SheetState; onCall: (callId: string) => void };

// Body of a room: call banner, content-reveal banner (staff), the conversation and the composer.
export function ChatRoomView({ roomId, room, myId, staff, closed, thread, send, reveal, sh, onCall }: Props) {
  const { t } = useT();
  const calls = useRoomCalls(roomId).data;
  const liveCalls = useMemo(() => (calls ? new Set(calls.filter((c) => isLive(c.status)).map((c) => c.id)) : undefined), [calls]);
  return (
    <KeyboardLift>
      <ActiveCallBar roomId={roomId} onJoin={onCall} />
      {staff ? <RevealBanner roomId={roomId} pending={!!reveal.requestId} onAsk={() => sh.setReveal("request")} onApprove={() => sh.setReveal("approve")} /> : null}
      <View style={s.fill}>
        <ChatThread msgs={thread.msgs} state={thread.state} error={thread.error} myId={myId} group={(room?.memberCount ?? 0) > 2} divider={thread.divider} hasOlder={thread.hasOlder} liveCalls={liveCalls} onOlder={thread.loadOlder} onReveal={thread.reveal} onMenu={sh.setTarget} onReply={sh.setReply} onCall={onCall} onOpen={sh.setFile} onRetry={thread.reload} />
      </View>
      <Composer roomId={roomId} onSend={send.sendText} onFile={send.sendFile} reply={sh.reply} onClearReply={() => sh.setReply(null)} closed={closed ? t("ms2.closedBar") : undefined} />
    </KeyboardLift>
  );
}

const s = StyleSheet.create({ fill: { flex: 1 } });
