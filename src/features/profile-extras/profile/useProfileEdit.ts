import { useMutation, useQueryClient } from "@tanstack/react-query";
import { profileKey, updateProfile } from "@/entities/profile-extras";
import { useSessionStore } from "@/entities/session";
import { usePaymentError } from "@/entities/payment";
import { useT } from "@/shared/i18n";
import { successHaptic } from "@/shared/lib/haptics";
import { toast } from "@/shared/ui";

// PUT /clients/me. The signed-in user's stored name follows, so the profile header updates at once.
export function useProfileEdit(onDone?: () => void) {
  const { t } = useT();
  const qc = useQueryClient();
  const fail = usePaymentError();
  return useMutation({
    mutationFn: (patch: { name?: string; email?: string; avatarUrl?: string }) => updateProfile(patch),
    onSuccess: (p) => {
      successHaptic();
      toast(t("py9.saved"), "ok");
      qc.setQueryData(profileKey, p);
      const st = useSessionStore.getState();
      if (st.session && p.name) void st.setUser({ ...st.session.user, name: p.name });
      onDone?.();
    },
    onError: fail,
  });
}
