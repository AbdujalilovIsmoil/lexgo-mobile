import { useState } from "react";
import { COMPLAINT_ACTIONS, useResolveComplaint, type ComplaintAction } from "@/entities/admin-callcenter";
import { useAppForm } from "@/shared/form";
import { confirmDialog } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { resolveSchema } from "./ccSchemas";

// The operator's ruling on a complaint: rework (free, same advocate) / reject (client gets the note) / close.
export function useResolveForm(id: string, allowed: string[], onDone: () => void) {
  const { t } = useT();
  const [action, setAction] = useState<ComplaintAction>("rework_required");
  const form = useAppForm(resolveSchema, { note: "" });
  const m = useResolveComplaint();
  const actions = COMPLAINT_ACTIONS.filter((a) => !allowed.length || allowed.includes(a));
  const submit = () =>
    void form.handleSubmit((v) =>
      confirmDialog({
        title: t("admCcB.resolveTitle"), message: t(`admCcB.cHint.${action}`), confirmLabel: t("admCcB.resolveSubmit"), cancelLabel: t("adm.cancel"), icon: "check-circle", danger: action === "rejected",
        onConfirm: async () => { await m.mutateAsync({ id, action, note: v.note }); form.reset(); onDone(); },
      }))();
  return { action, setAction, form, actions, submit, pending: m.isPending };
}
export type ResolveForm = ReturnType<typeof useResolveForm>;
