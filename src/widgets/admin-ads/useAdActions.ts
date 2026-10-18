import { confirmDialog } from "@/shared/ui";
import { useDeleteAd, type Ad } from "@/entities/admin-ads";
import { useT } from "@/shared/i18n";

// Confirmed soft delete of an ad product (the result toast comes from the mutation).
export function useAdDelete() {
  const { t } = useT();
  const del = useDeleteAd();
  return (a: Ad) => confirmDialog({ title: t("adm.confirmDeleteTitle"), message: `${a.title}\n${t("adm.confirmDeleteText")}`, confirmLabel: t("adm.delete"), cancelLabel: t("adm.cancel"), icon: "trash-2", danger: true, onConfirm: async () => { await del.mutateAsync(a.id); } });
}
