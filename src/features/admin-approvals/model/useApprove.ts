import { useApproveStep, typeLabel, type Approval, type Step } from "@/entities/admin-approvals";
import { confirmDialog } from "@/shared/ui";
import { useT } from "@/shared/i18n";

// Asks "sign this request as admin / manager?" and sends the approval when confirmed; a side is open until it has signed.
export function useApprove(item: Approval) {
  const { t } = useT();
  const m = useApproveStep();
  const ask = (step: Step) =>
    confirmDialog({
      title: t(`admAppr.${step}Approve`), message: t("admAppr.confirmText", { type: typeLabel(t, item.type), id: item.workId || "" }), confirmLabel: t(`admAppr.${step}Approve`), cancelLabel: t("adm.cancel"), icon: "check-circle",
      onConfirm: async () => { await m.mutateAsync({ id: item.id, step }); },
    });
  const shut = ["rejected", "cancelled"].includes(item.status);
  return { ask, pending: m.isPending, canAdmin: !shut && !item.adminApproved, canManager: !shut && !item.managerApproved };
}
