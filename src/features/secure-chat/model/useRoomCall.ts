import { useRef, useState } from "react";
import { useRouter } from "expo-router";
import { callPath, isLive, listCalls, startCall, startDocAudioCall, type CallType } from "@/entities/call";
import { ApiError } from "@/shared/api";
import { useT } from "@/shared/i18n";
import { toast } from "@/shared/ui";

// Starts a call in the room — or joins the one already running — and opens the call screen. A client reaches the
// advocate of a document request through `docRequestId` (POST /document-requests/{id}/calls/audio, 3 times at most).
export function useRoomCall(roomId: string, roomTitle: string, docRequestId = "") {
  const router = useRouter();
  const { t } = useT();
  const [busy, setBusy] = useState(false);
  const open = (callId: string, room = roomId) => router.push(callPath(room, callId) as never);
  const lock = useRef(false); // a ref, not `busy`: two taps in the same frame must not both reach the server
  const guard = async (fn: () => Promise<void>) => {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    try { await fn(); } catch (e) { toast(e instanceof ApiError && e.detail ? e.detail : t("admChat.callFailed"), "err"); }
    lock.current = false;
    setBusy(false);
  };
  const begin = (type: CallType) => guard(async () => {
    const live = (await listCalls(roomId)).find((c) => isLive(c.status));
    open(live ? live.id : (await startCall(roomId, type, roomTitle || t(type === "video" ? "admChat.videoCall" : "admChat.audioCall"))).id);
  });
  const docAudio = () => guard(async () => {
    const live = (await listCalls(roomId)).find((c) => isLive(c.status));
    if (live) return open(live.id);
    const c = await startDocAudioCall(docRequestId);
    open(c.id, c.roomId || roomId);
  });
  return { begin, docAudio, open, busy };
}
