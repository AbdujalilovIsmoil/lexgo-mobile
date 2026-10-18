import { useState } from "react";
import { useRouter } from "expo-router";
import { useStartCall, type CallKind, type SupportTicket } from "@/entities/admin-support";
import { toast } from "@/shared/ui";
import { useT } from "@/shared/i18n";

// Start an audio/video call from the ticket, then join the room in the chat screen (`?join=<callId>`).
export function useSupportCall(ticket: SupportTicket | null) {
  const router = useRouter();
  const { t } = useT();
  const start = useStartCall();
  const [kind, setKind] = useState<CallKind | "">("");
  const run = (k: CallKind) => {
    if (!ticket || kind) return;
    setKind(k);
    const title = ticket.workId ? t("admSup.callTitle", { id: ticket.workId }) : t("admSup.callTitlePlain");
    start.mutate(
      { id: ticket.id, kind: k, title },
      {
        onSuccess: (s) => (s.id && s.roomId ? router.push(`/chat/${encodeURIComponent(s.roomId)}?join=${encodeURIComponent(s.id)}` as never) : toast(t("admSup.callFailed"), "err")),
        onSettled: () => setKind(""),
      },
    );
  };
  return { calling: kind, start: run };
}
