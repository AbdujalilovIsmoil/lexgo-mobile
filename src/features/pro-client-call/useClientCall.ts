import { useRef, useState } from "react";
import { useRouter } from "expo-router";
import { callPath, isLive, listCalls, startCall, type CallType } from "@/entities/call";
import { useStartChat, type ClientDetail } from "@/entities/pro-clients";
import { useSession } from "@/entities/session";
import { ApiError } from "@/shared/api";
import { useT } from "@/shared/i18n";
import { toast } from "@/shared/ui";

// Calls and the secure chat from a client card. Every in-app call lives in a secure chat room, so the room is the client's existing chat
// or a new one (POST /secure-chats); then the call already running in it is joined, or a new audio / video call is started with the client
// invited (participant_user_ids — without it the backend does not ring them), and the call screen opens. A client added by hand has no
// LexGo account: no room, no in-app call (the card offers the phone instead).
export function useClientCall(d: ClientDetail | undefined) {
  const { t } = useT();
  const router = useRouter();
  const me = useSession()?.user.id ?? "";
  const start = useStartChat();
  const [busy, setBusy] = useState<"" | "chat" | CallType>("");
  const lock = useRef(false);
  const inApp = !!d && (!!d.chats[0] || !d.manual);
  const room = async (): Promise<string> => d?.chats[0]?.id || (await start.mutateAsync({ clientId: d?.id ?? "", sellerId: me }));
  const guard = async (kind: "chat" | CallType, fn: () => Promise<void>) => {
    if (lock.current || !d) return;
    lock.current = true;
    setBusy(kind);
    try { await fn(); } catch (e) { toast(e instanceof ApiError && e.detail ? e.detail : t("admChat.callFailed"), "err"); }
    lock.current = false;
    setBusy("");
  };
  const chat = () => guard("chat", async () => { const id = await room(); if (id) router.push(`/chat/${id}` as never); });
  const call = (type: CallType) => guard(type, async () => {
    const id = await room();
    if (!id) return;
    const live = (await listCalls(id)).find((c) => isLive(c.status));
    const c = live ?? (await startCall(id, type, d?.name || t(type === "video" ? "admChat.videoCall" : "admChat.audioCall"), d ? [d.id] : []));
    router.push(callPath(id, c.id) as never);
  });
  return { inApp, chat, call, busy };
}
