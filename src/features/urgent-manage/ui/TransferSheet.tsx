import { useMemo } from "react";
import { View } from "react-native";
import { useCandidates, useTransfer, type UrgentRequest } from "@/entities/urgent";
import { FormSheet, QueryBoundary } from "@/shared/ui/admin";
import { EmptyState, Text } from "@/shared/ui";
import { FormInput, useAppForm, useFieldError } from "@/shared/form";
import { useSheetReset } from "@/shared/lib/useSheetReset";
import { useT } from "@/shared/i18n";
import { CandidateRow } from "./CandidateRow";
import { transferSchema } from "./transferSchema";

type Props = { req: UrgentRequest; visible: boolean; onClose: () => void };

// Hand a claimed request to a better-fitting advocate (the backend moves assigned lawyer and claimer to the target).
export function TransferSheet({ req, visible, onClose }: Props) {
  const { t } = useT();
  const tr = useFieldError();
  const f = useAppForm(transferSchema, { pick: "", reason: "" });
  const pick = f.watch("pick");
  const q = useCandidates(req.id, { external: true, callcenter: true }, visible);
  const m = useTransfer();
  const holder = req.assignedLawyerUserId || req.claimedByUserId;
  const list = useMemo(() => (q.data ?? []).filter((c) => c.userId !== holder).sort((a, b) => b.score - a.score), [q.data, holder]);
  useSheetReset(visible, () => f.reset({ pick: "", reason: "" }));
  const submit = f.handleSubmit((v) => m.mutate({ id: req.id, userId: v.pick, reason: v.reason }, { onSuccess: onClose }));
  return (
    <FormSheet visible={visible} onClose={onClose} title={t("ug8.transfer")} onSubmit={() => void submit()} submitLabel={t("ug8.transferSubmit")} submitting={m.isPending}>
      <Text variant="small" tone="gray">{t("ug8.transferLead")}</Text>
      <QueryBoundary query={q}>
        {list.length ? <View style={{ gap: 10 }}>{list.map((c) => <CandidateRow key={c.userId} c={c} picked={pick === c.userId} onPress={() => f.setValue("pick", c.userId, { shouldValidate: true })} />)}</View> : <EmptyState compact icon="users" title={t("ug9.none")} />}
      </QueryBoundary>
      {f.formState.errors.pick ? <Text variant="small" tone="err">{tr(f.formState.errors.pick.message)}</Text> : null}
      <FormInput control={f.control} name="reason" label={t("adm.reason")} placeholder={t("ug8.transferReasonPh")} />
    </FormSheet>
  );
}
