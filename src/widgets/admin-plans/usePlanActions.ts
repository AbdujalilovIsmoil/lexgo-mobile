import { confirmDialog } from "@/shared/ui";
import { useDeletePlan, useResetPlan, useRestorePlan, useSavePlan, type Plan } from "@/entities/admin-plans";
import { useT } from "@/shared/i18n";

// Direct handlers of a tariff ticket: activate / deactivate, restore (hidden), reset overlay (overridden), delete (confirmed).
export function usePlanActions() {
  const { t } = useT();
  const save = useSavePlan("admPlans.saved");
  const del = useDeletePlan();
  const restore = useRestorePlan();
  const reset = useResetPlan();
  return {
    busy: save.isPending || del.isPending || restore.isPending || reset.isPending,
    toggle: (p: Plan) => save.mutate({ plan: p, body: { is_active: !p.isActive } }),
    restore: (p: Plan) => restore.mutate(p.slug),
    reset: (p: Plan) => reset.mutate(p.slug),
    remove: (p: Plan) => confirmDialog({ title: t("adm.confirmDeleteTitle"), message: t("admPlans.deleteText", { name: p.name }), confirmLabel: t("adm.delete"), cancelLabel: t("adm.cancel"), icon: "trash-2", danger: true, onConfirm: async () => { await del.mutateAsync(p); } }),
  };
}
