import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { ApiError } from "@/shared/api";
import { useT } from "@/shared/i18n";
import { errorHaptic } from "@/shared/lib/haptics";
import { toast } from "@/shared/ui";
import { isLive, listCalls } from "@/entities/admin-meetings";
import { callRoute, createMeeting, type DocReq } from "@/entities/doc-queue";

// The running call in the request's secure-chat room (looked up on demand: every POST …/meeting creates a new one).
export function useLiveCall(roomId: string, enabled: boolean) {
  return useQuery({ queryKey: ["pro-docs", "calls", roomId], enabled: enabled && !!roomId, staleTime: 0, queryFn: async () => (await listCalls(roomId)).find((c) => isLive(c.status))?.id ?? "" });
}

// Start a video meeting about this document and open the call screen; or join the one already running.
export function useMeeting(doc: DocReq, liveId: string) {
  const router = useRouter();
  const { t } = useT();
  const start = useMutation({
    mutationFn: () => createMeeting(doc.id, `${t("ad5.meetingTitle")} · ${doc.clientName}`.trim()),
    onSuccess: (m) => router.push(callRoute(m.roomId, m.id)),
    onError: (e) => {
      errorHaptic();
      toast(e instanceof ApiError && e.detail ? e.detail : t("ad5.meetingFail"), "err");
    },
  });
  const join = () => router.push(callRoute(doc.chatRoomId, liveId));
  return { start, join, live: !!liveId };
}
