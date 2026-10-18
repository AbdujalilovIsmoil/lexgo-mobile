import { useMutation, useQueryClient } from "@tanstack/react-query";
import { acceptConsent, consentsKey } from "@/entities/profile-extras";
import { usePaymentError } from "@/entities/payment";
import { useT } from "@/shared/i18n";
import { successHaptic } from "@/shared/lib/haptics";
import { confirmDialog, toast } from "@/shared/ui";

// Accept (or re-accept a new version of) a legal document: asks first, then POST .../accept.
// The backend has no way to withdraw a consent, so that is never offered as a button.
export function useAcceptConsent(onDone?: () => void) {
  const { t } = useT();
  const qc = useQueryClient();
  const fail = usePaymentError();
  const m = useMutation({
    mutationFn: (v: { id: string; version: string }) => acceptConsent(v.id, v.version),
    onSuccess: () => {
      successHaptic();
      toast(t("py7.accepted"), "ok");
      void qc.invalidateQueries({ queryKey: consentsKey });
      onDone?.();
    },
    onError: fail,
  });
  const confirm = (v: { id: string; version: string; title: string }) =>
    confirmDialog({ title: t("py7.confirm.title"), message: t("py7.confirm.text", { title: v.title, v: v.version }), confirmLabel: t("py7.accept"), cancelLabel: t("common.cancel"), icon: "check-circle", onConfirm: () => m.mutate(v) });
  return { confirm, pending: m.isPending };
}
