import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@/shared/api";
import { errorHaptic } from "@/shared/lib/haptics";
import { useT } from "@/shared/i18n";
import { toast } from "@/shared/ui";
import { getSecurityProfile } from "../api/profileApi";
import { listSessions } from "../api/deviceApi";
import { listActivity, listSecurityEvents } from "../api/historyApi";
import { getNotifPrefs, setNotifPref } from "../api/prefsApi";
import { secKeys } from "./keys";
import type { NotifKey, NotifPrefs } from "./types";

export const useSecurityProfile = () => useQuery({ queryKey: secKeys.profile, queryFn: getSecurityProfile });
export const useDeviceSessions = () => useQuery({ queryKey: secKeys.sessions, queryFn: listSessions });
export const useSecurityEvents = () => useQuery({ queryKey: secKeys.events, queryFn: listSecurityEvents });
export const useActivity = () => useQuery({ queryKey: secKeys.activity, queryFn: listActivity });
export const useNotifPrefs = () => useQuery({ queryKey: secKeys.prefs, queryFn: getNotifPrefs });

// Optimistic toggle: the switch flips at once and reverts (with the server's message) on failure.
export function useTogglePref() {
  const qc = useQueryClient();
  const { t } = useT();
  return useMutation({
    mutationFn: ({ key, value }: { key: NotifKey; value: boolean }) => setNotifPref(key, value),
    onMutate: async ({ key, value }) => {
      await qc.cancelQueries({ queryKey: secKeys.prefs });
      const prev = qc.getQueryData<NotifPrefs>(secKeys.prefs);
      if (prev) qc.setQueryData(secKeys.prefs, { ...prev, [key]: value });
      return { prev };
    },
    onError: (e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(secKeys.prefs, ctx.prev);
      errorHaptic();
      toast(e instanceof ApiError && e.detail ? e.detail : t("adm.actionFailed"), "err");
    },
  });
}
