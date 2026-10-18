import "@/features/call/call"; // first: registers the LiveKit / WebRTC globals before anything uses them
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { usePreventScreenCapture } from "expo-screen-capture";
import { useQuery } from "@tanstack/react-query";
import { isLive, listCalls } from "@/entities/call";
import { CallRoomView, CallStatusView } from "@/widgets/call/call";
import { useT } from "@/shared/i18n";

// /call/<roomId>?callId=<id> — the in-app LiveKit call (audio / video / meeting). Without `callId` the room's running
// call is joined. Screenshots and screen recording are blocked while it is open (TZ 40).
export default function CallPage() {
  // TEMP-SHOTS usePreventScreenCapture();
  const { t } = useT();
  const router = useRouter();
  const { roomId, callId } = useLocalSearchParams<{ roomId: string; callId?: string }>();
  const room = String(roomId);
  const found = useQuery({ queryKey: ["call", "resolve", room], queryFn: async () => (await listCalls(room)).find((c) => isLive(c.status))?.id ?? "", enabled: !callId });
  const id = callId ? String(callId) : found.data ?? "";
  const back = () => (router.canGoBack() ? router.back() : router.replace("/meetings" as never));
  return (
    <>
      <Stack.Screen options={{ gestureEnabled: false, animation: "slide_from_bottom" }} />
      {id ? <CallRoomView roomId={room} callId={id} /> : <CallStatusView kind={found.isLoading ? "connecting" : "error"} message={found.isLoading ? undefined : t("admMeetB.errGone")} onBack={back} />}
    </>
  );
}
