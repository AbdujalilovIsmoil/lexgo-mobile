import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useIsAuthed } from "@/entities/session";
import { ApiError } from "@/shared/api";
import { useT } from "@/shared/i18n";
import { enqueuePut } from "@/shared/cache";
import { errorHaptic, selectHaptic } from "@/shared/lib/haptics";
import { isOnline } from "@/shared/network";
import { toast } from "@/shared/ui";
import { getPrefs, putPrefs, PREF_DEFAULTS, type PrefKey, type Prefs } from "../api/prefsApi";
import { notificationKeys } from "./keys";

export const usePrefs = () => {
  const authed = useIsAuthed();
  return useQuery({ queryKey: notificationKeys.prefs, queryFn: getPrefs, enabled: authed, staleTime: 5 * 60_000 });
};

// Flips one switch at once and sends the whole set. Offline, the change is queued (a PUT of the
// same document is idempotent) and goes out when the connection returns.
export function useSavePref() {
  const qc = useQueryClient();
  const { t } = useT();
  return useMutation({
    mutationFn: async ({ key, value }: { key: PrefKey; value: boolean }) => {
      const next = { ...(qc.getQueryData<Prefs>(notificationKeys.prefs) ?? PREF_DEFAULTS), [key]: value };
      if (isOnline()) await putPrefs(next);
      else if (await enqueuePut("/notifications/preferences", next)) toast(t("nt2.savedOffline"), "info");
      else throw new ApiError(0, "network_error");
    },
    onMutate: ({ key, value }) => {
      selectHaptic();
      const prev = qc.getQueryData<Prefs>(notificationKeys.prefs);
      qc.setQueryData<Prefs>(notificationKeys.prefs, { ...(prev ?? PREF_DEFAULTS), [key]: value });
      return { prev };
    },
    onError: (e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(notificationKeys.prefs, ctx.prev);
      errorHaptic();
      toast(e instanceof ApiError && e.detail && e.status !== 0 ? e.detail : t("nt2.saveFailed"), "err");
    },
  });
}
