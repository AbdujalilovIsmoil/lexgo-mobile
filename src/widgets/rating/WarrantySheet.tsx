import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createWarranty, useComplaintTargets, workRefValue, type WarrantyClaim } from "@/entities/rating";
import { usePaymentError } from "@/entities/payment";
import { FormSheet, SelectField } from "@/shared/ui/admin";
import { FormInput, rules, useAppForm } from "@/shared/form";
import { useSheetReset } from "@/shared/lib/useSheetReset";
import { successHaptic } from "@/shared/lib/haptics";
import { useT } from "@/shared/i18n";

// Ask LexGo to replace the lawyer (POST /warranty/claims); a manager reviews it.
export function WarrantySheet({ visible, onClose, onSent }: { visible: boolean; onClose: () => void; onSent: (c: WarrantyClaim) => void }) {
  const { t } = useT();
  const qc = useQueryClient();
  const fail = usePaymentError();
  const [work, setWork] = useState("");
  const f = useAppForm(rules.reason, { reason: "" });
  useSheetReset(visible, () => { f.reset({ reason: "" }); setWork(""); });
  const targets = useComplaintTargets(visible);
  const m = useMutation({
    mutationFn: (reason: string) => createWarranty(reason, work),
    onSuccess: (c) => {
      successHaptic();
      void qc.invalidateQueries({ queryKey: ["rate-warranty"] });
      onClose();
      onSent(c);
    },
    onError: fail,
  });
  return (
    <FormSheet visible={visible} onClose={onClose} title={t("py10.w.title")} subtitle={t("py10.w.lead")} submitLabel={t("py10.w.send")} submitting={m.isPending} onSubmit={() => void f.handleSubmit((v) => m.mutate(v.reason))()}>
      {targets.data?.length ? <SelectField label={t("py10.w.case")} value={work} onChange={setWork} searchable options={[{ value: "", label: t("py5.form.relatedNone") }, ...targets.data.map((w) => ({ value: workRefValue(w), label: w.title || w.workId, hint: w.workId }))]} /> : null}
      <FormInput control={f.control} name="reason" label={t("py10.w.reason")} multiline numberOfLines={4} maxLength={1000} placeholder={t("py10.w.reasonPh")} style={{ minHeight: 100, textAlignVertical: "top" }} />
    </FormSheet>
  );
}
