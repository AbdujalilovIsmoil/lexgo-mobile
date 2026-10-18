import { useT } from "@/shared/i18n";
import { confirmDialog } from "@/shared/ui";

// Wraps a sheet's close handler: with unsaved edits it asks "discard changes?" first (texts: admLegalC.dirty).
export function useDirtyClose(dirty: boolean, onClose: () => void): () => void {
  const { t } = useT();
  return () => {
    if (!dirty) return onClose();
    confirmDialog({ title: t("admLegalC.dirty.title"), message: t("admLegalC.dirty.text"), confirmLabel: t("admLegalC.dirty.leave"), cancelLabel: t("admLegalC.dirty.stay"), icon: "alert-triangle", danger: true, onConfirm: onClose });
  };
}
