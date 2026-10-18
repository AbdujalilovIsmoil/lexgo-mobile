import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addMethod, deleteMethod, methodsKey, type MethodInput, type PayMethod } from "@/entities/profile-extras";
import { usePaymentError } from "@/entities/payment";
import { useT } from "@/shared/i18n";
import { successHaptic } from "@/shared/lib/haptics";
import { confirmDialog, toast } from "@/shared/ui";

// Saved-card writes. Only brand + last 4 digits + expiry are ever sent — and never logged.
export function useMethodActions(onSaved?: () => void) {
  const { t } = useT();
  const qc = useQueryClient();
  const fail = usePaymentError();
  const done = (key: string) => {
    successHaptic();
    toast(t(key), "ok");
    void qc.invalidateQueries({ queryKey: methodsKey });
  };
  const add = useMutation({ mutationFn: (i: MethodInput) => addMethod(i), onSuccess: () => { done("py6.card.added"); onSaved?.(); }, onError: fail });
  const remove = useMutation({ mutationFn: (id: string) => deleteMethod(id), onSuccess: () => done("py6.removed"), onError: fail });
  const confirmRemove = (m: PayMethod) =>
    confirmDialog({ title: t("py6.card.removeTitle"), message: t("py6.card.removeText", { card: `${m.brand.toUpperCase()} •••• ${m.last4}` }), confirmLabel: t("adm.delete"), cancelLabel: t("common.cancel"), icon: "trash-2", danger: true, onConfirm: () => remove.mutate(m.id) });
  return { add, remove, confirmRemove };
}
