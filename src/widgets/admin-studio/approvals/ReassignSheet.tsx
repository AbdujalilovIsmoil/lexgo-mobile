import { useState } from "react";
import { FormSheet, SelectField } from "@/shared/ui/admin";
import { Input } from "@/shared/ui";
import { reassignStep, studioKeys, useApprovalUsers, type StudioStep } from "@/entities/admin-studio";
import { useAdminMutation } from "@/shared/lib/useAdminMutation";
import { useKept } from "@/shared/lib/useKept";
import { useT } from "@/shared/i18n";

type Props = { step: StudioStep | null; code: string; onClose: () => void };

// Hand one approver's share of a step to someone else: who (one of the step's approvers), to whom (the studio's people, not already on
// the step) and an optional message. Needs the "studio.approval.reassign" permission.
export function ReassignSheet({ step: current, code, onClose }: Props) {
  const { t } = useT();
  const step = useKept(current);
  const users = useApprovalUsers("", code, !!current);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [message, setMessage] = useState("");
  const approvers = step?.approvers ?? [];
  const sender = from || (approvers.length === 1 ? approvers[0].id : "");
  const taken = new Set(approvers.map((a) => a.id));
  const done = () => { setFrom(""); setTo(""); setMessage(""); onClose(); };
  const m = useAdminMutation({ mutationFn: () => reassignStep(step?.id ?? "", { from: sender, to, message: message.trim() }), invalidate: [studioKeys.all], success: "admStudioD.approvals.reassigned", onSuccess: done });
  return (
    <FormSheet visible={!!current} onClose={onClose} title={t("admStudioD.approvals.reassignTitle")} subtitle={step?.title || undefined} onSubmit={() => m.mutate()} submitLabel={t("admStudioD.approvals.reassign")} submitting={m.isPending} disabled={!sender || !to}>
      <SelectField label={t("admStudioD.approvals.from")} value={sender} options={approvers.map((a) => ({ value: a.id, label: a.name || a.id }))} onChange={setFrom} />
      <SelectField label={t("admStudioD.approvals.to")} value={to} placeholder={t("admStudioD.approvals.pick")} searchable options={(users.data ?? []).filter((u) => !taken.has(u.id)).map((u) => ({ value: u.id, label: u.name || u.code, hint: u.code }))} onChange={setTo} />
      <Input label={t("admStudioD.approvals.message")} value={message} onChangeText={setMessage} placeholder={t("admStudioD.approvals.messagePh")} multiline maxLength={500} />
    </FormSheet>
  );
}
