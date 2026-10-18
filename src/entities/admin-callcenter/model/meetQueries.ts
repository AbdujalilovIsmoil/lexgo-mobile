import { ApiError } from "@/shared/api";
import { useT } from "@/shared/i18n";
import { useAdminMutation } from "@/shared/lib/useAdminMutation";
import { findUserByPhone, startClientMeeting } from "../api/meetApi";

export type MeetTarget = { clientUserId: string; phone: string; title: string };

// Video meeting with a lead's client; a phone-only lead is first matched to a platform user.
export function useStartMeeting(onStarted: (ids: { roomId: string; callId: string }) => void) {
  const { t } = useT();
  return useAdminMutation({
    mutationFn: async (m: MeetTarget) => {
      const uid = m.clientUserId || (await findUserByPhone(m.phone));
      if (!uid) throw new ApiError(404, t("admCcB.meetNoUser"));
      return startClientMeeting(uid, m.title);
    },
    success: "admCcB.meetStarted",
    onSuccess: onStarted,
  });
}
