import { View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { usePreventScreenCapture } from "expo-screen-capture";
import { ErrorView, IconButton } from "@/shared/ui";
import { ChatHeader, ChatRoomView, ChatSheets } from "@/widgets/secure-chat";
import { useAccess } from "@/entities/access";
import { useSellerActions } from "@/features/secure-chat";
import { useT } from "@/shared/i18n";
import { useColors } from "@/shared/theme";
import { useChatRoom } from "./useChatRoom";

// One secure chat. Screenshots / screen recording are blocked while it is open (TZ 40).
export default function ChatRoomPage() {
  // TEMP-SHOTS usePreventScreenCapture();
  const { t } = useT();
  const c = useColors();
  const a = useAccess();
  const { roomId, join, doc } = useLocalSearchParams<{ roomId: string; join?: string; doc?: string }>();
  const id = String(roomId);
  const r = useChatRoom(id, join, doc);
  const group = (r.room?.memberCount ?? 0) > 2;
  const online = r.thread.conn === "online";
  const sub = group ? `${online ? t("admChat.online") : t("admChat.reconnecting")} · ${t("admChat.members", { n: r.room?.memberCount ?? 0 })}` : online ? t("admChat.online") : t("admChat.reconnecting");
  const sellerCalls = useSellerActions().calls;
  const calls = a.canCalls && sellerCalls && !r.closed;
  const right = (
    <>
      {calls ? <><IconButton icon="phone" size={40} label={t("admChat.audioCall")} onPress={() => void r.call.begin("audio")} /><IconButton icon="video" size={40} label={t("admChat.videoCall")} onPress={() => void r.call.begin("video")} /></> : null}
      {!a.canCalls && doc && !r.closed ? <IconButton icon="phone" size={40} label={t("ms2.callAdvocate")} onPress={() => void r.call.docAudio()} /> : null}
      <IconButton icon="more-vertical" size={40} onPress={() => r.sh.setSheet("menu")} />
    </>
  );
  return (
    <View style={{ flex: 1, backgroundColor: c.canvas }}>
      <ChatHeader title={r.title} subtitle={sub} group={group} online={online} onInfo={() => r.sh.setSheet("members")} right={right} />
      {r.error && !r.room ? <ErrorView error={r.error} /> : <ChatRoomView roomId={id} room={r.room} myId={r.myId} staff={a.staff} closed={r.closed} thread={r.thread} send={r.send} reveal={r.reveal} sh={r.sh} onCall={r.call.open} />}
      <ChatSheets sh={r.sh} room={r.room} myId={r.myId} actions={r.actions} reveal={r.reveal} settings={r.settings} complete={r.complete} onRetry={r.send.retry} onDiscard={r.send.discard} />
    </View>
  );
}
