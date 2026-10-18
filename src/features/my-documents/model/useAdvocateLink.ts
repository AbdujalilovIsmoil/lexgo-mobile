import { useState } from "react";
import { useRouter } from "expo-router";
import { useMutation } from "@tanstack/react-query";
import { ApiError } from "@/shared/api";
import { useT } from "@/shared/i18n";
import { errorHaptic } from "@/shared/lib/haptics";
import { toast } from "@/shared/ui";
import { callPath, chatPath, startAudioCall, useDocChat, type MyDoc } from "@/entities/my-document";

// Chat room and audio call with the advocate who took the document (TZ 15, 23).
// Before a claim the backend says available:false — a state, not an error.
export function useAdvocateLink(doc: MyDoc, enabled: boolean) {
  const { t } = useT();
  const router = useRouter();
  const chat = useDocChat(doc.id, enabled);
  const [left, setLeft] = useState<number | null>(null);
  const call = useMutation({
    mutationFn: () => startAudioCall(doc.id),
    onSuccess: (c) => {
      setLeft(c.remaining);
      const room = c.roomId || chat.data?.roomId || "";
      if (room && c.id) router.push(callPath(room, c.id) as never);
      else toast(t("dm6.callFail"), "err");
    },
    onError: (e) => {
      errorHaptic();
      toast(e instanceof ApiError && e.status === 429 ? t("dm6.callLimit") : e instanceof ApiError && e.detail ? e.detail : t("dm6.callFail"), "err");
    },
  });
  const roomId = chat.data?.available ? chat.data.roomId : "";
  return { chat, roomId, call, left, openChat: () => roomId && router.push(chatPath(roomId) as never) };
}
