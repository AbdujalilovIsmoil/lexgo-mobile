import { useState } from "react";
import { hasBad, useSavePolicy, type Section } from "@/entities/admin-policies";
import type { Dict } from "@/shared/lib/json";
import { FormSheet } from "@/shared/ui/admin";
import { Text, confirmDialog } from "@/shared/ui";
import { useKept } from "@/shared/lib/useKept";
import { useSheetReset } from "@/shared/lib/useSheetReset";
import { useDirtyClose } from "@/shared/lib/useDirtyClose";
import { useT } from "@/shared/i18n";
import { PolicyNode } from "./PolicyNode";

// Edit one policy section: every field becomes a typed control derived from the stored JSON.
// A change applies to the whole platform at once, so saving is confirmed and creates a new version.
export function PolicyEditSheet({ section, data, onClose }: { section: Section | null; data: Dict; onClose: () => void }) {
  const { t } = useT();
  const kept = useKept(section);
  const [draft, setDraft] = useState<Dict>(data);
  const save = useSavePolicy();
  useSheetReset(!!section, () => setDraft(data));
  const bad = hasBad(draft);
  const dirty = JSON.stringify(draft) !== JSON.stringify(data);
  const close = useDirtyClose(!!section && dirty, onClose);
  const name = kept ? t(`admPol.sections.${kept}`) : "";
  const submit = () =>
    kept && confirmDialog({
      title: t("admPol.saveConfirm"), message: t("admPol.saveConfirmText", { section: name }), confirmLabel: t("adm.save"), cancelLabel: t("adm.cancel"), icon: "sliders",
      onConfirm: async () => { await save.mutateAsync({ section: kept, data: draft }); onClose(); },
    });
  return (
    <FormSheet visible={!!section} onClose={close} title={t("admPol.editTitle", { section: name })} subtitle={bad ? t("admPol.fixInvalid") : undefined} onSubmit={submit} submitting={save.isPending} disabled={bad || !dirty}>
      <Text variant="small" tone="gray">{t("admPol.editLead")}</Text>
      {Object.entries(draft).filter(([k]) => k !== "work_id").map(([k, v]) => <PolicyNode key={k} name={k} value={v} onChange={(nv) => setDraft((d) => ({ ...d, [k]: nv }))} />)}
      <Text variant="caption" tone="gray2">{t("admPol.saveHint")}</Text>
    </FormSheet>
  );
}
