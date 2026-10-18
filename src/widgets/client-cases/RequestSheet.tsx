import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { FormInput, rules, useAppForm } from "@/shared/form";
import { Text, toast } from "@/shared/ui";
import { FormSheet, SelectField } from "@/shared/ui/admin";
import { useSheetReset } from "@/shared/lib/useSheetReset";
import { useT } from "@/shared/i18n";
import { ApiError } from "@/shared/api";
import { caseKeys, sendCaseRequest, type ClientCase } from "@/entities/client-case";

type Kind = "refund" | "replacement";

// Refund / lawyer-replacement request for a case (POST /refund-requests | /replacement-requests).
export function RequestSheet({ target, onClose }: { target: ClientCase | null; onClose: () => void }) {
  const { t } = useT();
  const qc = useQueryClient();
  const [kind, setKind] = useState<Kind>("refund");
  const f = useAppForm(rules.reason, { reason: "" });
  const [busy, setBusy] = useState(false);
  useSheetReset(!!target, () => f.reset({ reason: "" }));
  const submit = f.handleSubmit(async ({ reason }) => {
    if (!target || busy) return;
    setBusy(true);
    try {
      await sendCaseRequest(kind, { id: target.id, orderId: target.orderId, label: target.caseType || target.caseNumber }, reason);
      toast(t("ccs.requestSent"), "ok");
      void qc.invalidateQueries({ queryKey: caseKeys.repl(target.id) });
      onClose();
    } catch (e) {
      toast((e instanceof ApiError && e.detail) || t("ccs.requestError"), "err");
    } finally { setBusy(false); }
  });
  return (
    <FormSheet visible={!!target} onClose={onClose} title={t("ccs.requestTitle")} onSubmit={() => void submit()} submitLabel={busy ? t("ccs.requestSending") : t("ccs.requestSubmit")} submitting={busy}>
      <Text variant="small" tone="gray">{t("ccs.requestLead")}</Text>
      <SelectField<Kind> label={t("ccs.requestKind")} value={kind} onChange={setKind} options={[{ value: "refund", label: t("ccs.refund") }, { value: "replacement", label: t("ccs.replacement") }]} />
      <FormInput control={f.control} name="reason" label={t("ccs.requestReason")} placeholder={t("ccs.requestReasonPh")} multiline numberOfLines={3} maxLength={1000} textAlignVertical="top" />
      <Text variant="caption" tone="gray2">{t("ccs.requestNote")}</Text>
    </FormSheet>
  );
}
