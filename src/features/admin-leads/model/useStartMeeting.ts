import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { ApiError } from "@/shared/api";
import { useSession } from "@/entities/session";
import type { Lead } from "@/entities/admin-leads";
import { useT } from "@/shared/i18n";
import { toast } from "@/shared/ui";
import { createMeeting, findUserByPhone } from "../api/meetingApi";

// Starts a video meeting with the lead's client, then opens the chat room that hosts the call.
// `leave` closes whatever sheet is open and runs the navigation once it is gone.
export function useStartMeeting(lead: Lead, leave: (fn: () => void) => void) {
  const { t } = useT();
  const router = useRouter();
  const me = useSession()?.user.id ?? "";
  return useMutation({
    mutationFn: async () => {
      const uid = lead.clientUserId || (await findUserByPhone(lead.phone));
      if (!uid) throw new Error("noUser");
      if (uid === me) throw new Error("self");
      return createMeeting(uid, t("admLeads.meetingTitle", { name: lead.name || lead.phone }));
    },
    onSuccess: (r) => leave(() => router.push(`/chat/${r.roomId}?join=${r.callId}` as never)),
    onError: (e) => {
      const s = e instanceof ApiError ? e.status : 0;
      const key = e instanceof Error && e.message === "noUser" ? "meetNoUser" : e instanceof Error && e.message === "self" ? "meetSelf" : s === 402 || s === 403 ? "meetDenied" : s === 404 || s === 405 || s === 501 ? "meetMissing" : "meetError";
      toast(t(`admLeadsB.${key}`), "err");
    },
  });
}
