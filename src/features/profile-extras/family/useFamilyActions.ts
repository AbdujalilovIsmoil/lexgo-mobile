import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addFamily, deleteFamily, familyKey, updateFamily, type FamilyInput, type FamilyMember } from "@/entities/profile-extras";
import { isPaymentRequired } from "@/shared/api";
import { entitlementKeys } from "@/entities/plan";
import { usePaymentError } from "@/entities/payment";
import { useT } from "@/shared/i18n";
import { successHaptic } from "@/shared/lib/haptics";
import { confirmDialog, toast } from "@/shared/ui";

// Family-member writes. Sharing the plan needs an active tariff: the backend answers 402 and
// usePaymentError explains it and offers the tariffs.
export function useFamilyActions(onSaved?: () => void) {
  const { t } = useT();
  const qc = useQueryClient();
  const fail = usePaymentError();
  const done = (key: string) => {
    successHaptic();
    toast(t(key), "ok");
    void qc.invalidateQueries({ queryKey: familyKey });
    void qc.invalidateQueries({ queryKey: entitlementKeys.all });
  };
  const save = useMutation({
    mutationFn: (v: { id?: string; input: FamilyInput }) => (v.id ? updateFamily(v.id, v.input) : addFamily(v.input)),
    onSuccess: (_, v) => { done(v.id ? "py6.saved" : "py6.added"); onSaved?.(); },
    onError: fail,
  });
  const share = useMutation({ mutationFn: (v: { id: string; on: boolean }) => updateFamily(v.id, { sharedAccess: v.on }), onSuccess: () => done("py6.saved"), onError: (e) => (isPaymentRequired(e) ? toast(t("cpr.famPlan"), "err") : fail(e)) });
  const remove = useMutation({ mutationFn: (id: string) => deleteFamily(id), onSuccess: () => { done("py6.removed"); onSaved?.(); }, onError: fail });
  const confirmRemove = (m: FamilyMember) =>
    confirmDialog({ title: t("py6.remove.title"), message: t("py6.remove.text", { name: m.name || m.phone }), confirmLabel: t("adm.delete"), cancelLabel: t("common.cancel"), icon: "trash-2", danger: true, onConfirm: () => remove.mutate(m.id) });
  return { save, share, remove, confirmRemove };
}
