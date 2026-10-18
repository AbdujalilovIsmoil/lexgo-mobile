import { getRegDetail, fourStepsDone, useAcceptRequest, useRejectRequest } from "@/entities/admin-reg";
import { confirmDialog, toast } from "@/shared/ui";
import { useT } from "@/shared/i18n";

export type Target = { id: string; name: string };

// Accept / reject a registration request behind a confirmation. Accept re-reads the request first and
// refuses unless all four verification steps are done (the web's rule), so a stale list can't bypass it.
export function useDecision(onDone?: () => void) {
  const { t } = useT();
  const acceptM = useAcceptRequest();
  const rejectM = useRejectRequest();
  const accept = (r: Target) =>
    confirmDialog({
      title: t("admReg.acceptTitle"), message: t("admReg.acceptText", { name: r.name }), confirmLabel: t("admReg.accept"), cancelLabel: t("adm.cancel"), icon: "user-check",
      onConfirm: async () => {
        if (!fourStepsDone(await getRegDetail(r.id))) return toast(t("admRegB.fourBlocked"), "err");
        await acceptM.mutateAsync(r.id);
        onDone?.();
      },
    });
  const reject = (r: Target) =>
    confirmDialog({
      title: t("admReg.rejectTitle"), message: t("admReg.rejectText", { name: r.name }), confirmLabel: t("admReg.reject"), cancelLabel: t("adm.cancel"), icon: "user-x", danger: true,
      onConfirm: async () => {
        await rejectM.mutateAsync(r.id);
        onDone?.();
      },
    });
  return { accept, reject, busy: acceptM.isPending || rejectM.isPending };
}
