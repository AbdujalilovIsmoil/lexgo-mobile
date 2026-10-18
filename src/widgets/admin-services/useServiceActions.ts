import { confirmDialog } from "@/shared/ui";
import { useDeleteService, useUpdateService, type AdminService } from "@/entities/admin-services";
import { useT } from "@/shared/i18n";

// Row actions of a service: soft-delete (confirmed) while active, reactivate while inactive.
export function useServiceActions() {
  const { t } = useT();
  const del = useDeleteService();
  const react = useUpdateService("admSvc.reactivated");
  return {
    remove: (s: AdminService) => confirmDialog({ title: t("admSvc.delTitle"), message: t("admSvc.delText", { name: s.name }), confirmLabel: t("adm.delete"), cancelLabel: t("adm.cancel"), icon: "trash-2", danger: true, onConfirm: async () => { await del.mutateAsync(s.id); } }),
    reactivate: (s: AdminService) => react.mutate({ id: s.id, body: { is_active: true } }),
  };
}
