import { confirmDialog } from "@/shared/ui";
import { useDeleteTemplate, useUpdateTemplate, type Template } from "@/entities/admin-templates";
import { useT } from "@/shared/i18n";

// Ticket actions of a template: confirmed delete (irreversible) and publish / hide (PATCH is_active only).
export function useTemplateActions() {
  const { t } = useT();
  const del = useDeleteTemplate();
  const upd = useUpdateTemplate();
  return {
    remove: (d: Template) => confirmDialog({ title: t("adm.confirmDeleteTitle"), message: `${d.name}\n${t("adm.confirmDeleteText")}`, confirmLabel: t("adm.delete"), cancelLabel: t("adm.cancel"), icon: "trash-2", danger: true, onConfirm: async () => { await del.mutateAsync(d.id); } }),
    toggle: (d: Template) => upd.mutate({ id: d.id, body: { is_active: !d.isActive } }),
  };
}
