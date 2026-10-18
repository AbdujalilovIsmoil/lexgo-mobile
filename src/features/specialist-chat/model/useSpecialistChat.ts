import { useState } from "react";
import { useRouter } from "expo-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { chatPath } from "@/entities/call";
import { chatKeys, openPrivateChat } from "@/entities/secure-chat";
import { useIsAuthed } from "@/entities/session";
import { ApiError } from "@/shared/api";
import { useT } from "@/shared/i18n";
import { errorHaptic, successHaptic } from "@/shared/lib/haptics";
import { toast } from "@/shared/ui";

// "Chat" on a specialist's profile: GET /lawyers/{id}/private-chat opens the room (and the screen). A client who has
// not paid the one-time fee gets 402 → `fee` opens the payment sheet; once paid, `open` is called again.
export function useSpecialistChat(lawyerId: string) {
  const router = useRouter();
  const qc = useQueryClient();
  const { t } = useT();
  const authed = useIsAuthed();
  const [fee, setFee] = useState(false);
  const mutation = useMutation({
    mutationFn: () => openPrivateChat(lawyerId),
    onSuccess: (room) => {
      successHaptic();
      setFee(false);
      void qc.invalidateQueries({ queryKey: chatKeys.rooms });
      router.push(chatPath(room.id) as never);
    },
    onError: (e) => {
      errorHaptic();
      if (e instanceof ApiError && e.status === 402) return setFee(true);
      toast(e instanceof ApiError && e.detail ? e.detail : t("adm.actionFailed"), "err");
    },
  });
  const start = () => (authed ? mutation.mutate() : router.push("/auth/login"));
  return { start, open: () => mutation.mutate(), opening: mutation.isPending, fee, closeFee: () => setFee(false) };
}
