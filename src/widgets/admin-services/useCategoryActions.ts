import { confirmDialog } from "@/shared/ui";
import { useHideCategory, useResetCategory, useRestoreCategory, type OverlaidCategory } from "@/entities/admin-services";
import { useT } from "@/shared/i18n";

// Direct actions of one category: hide (confirmed), restore, reset the override.
export function useCategoryActions() {
  const { t } = useT();
  const hide = useHideCategory();
  const restore = useRestoreCategory();
  const reset = useResetCategory();
  return {
    hide: (c: OverlaidCategory) => confirmDialog({ title: t("adm.confirmDeleteTitle"), message: t("admSvc.catDeleteText", { name: c.name }), confirmLabel: t("adm.delete"), cancelLabel: t("adm.cancel"), icon: "trash-2", danger: true, onConfirm: async () => { await hide.mutateAsync(c.id); } }),
    restore: (c: OverlaidCategory) => restore.mutate(c.id),
    reset: (c: OverlaidCategory) => reset.mutate(c.id),
  };
}
