import { useMemo } from "react";
import { View } from "react-native";
import { useCandidates, useTransferUrgent, type UrgentRequest } from "@/entities/admin-callcenter";
import { FormSheet, QueryBoundary } from "@/shared/ui/admin";
import { EmptyState, Text } from "@/shared/ui";
import { FormInput, useAppForm } from "@/shared/form";
import { useT } from "@/shared/i18n";
import { ccTransferSchema } from "../model/ccSchemas";
import { CandidateRow } from "./CandidateRow";

type Props = { req: UrgentRequest; visible: boolean; onClose: () => void };

// Hand a claimed request to a better-fitting advocate (backend moves assigned lawyer and claimer to the target).
export function TransferSheet({ req, visible, onClose }: Props) {
  const { t } = useT();
  const f = useAppForm(ccTransferSchema, { pick: "", reason: "" });
  const pick = f.watch("pick");
  const q = useCandidates(req.id, { external: true, callcenter: true }, visible);
  const m = useTransferUrgent();
  const holder = req.assignedLawyerUserId || req.claimedByUserId;
  const list = useMemo(() => (q.data ?? []).filter((c) => c.userId !== holder).sort((a, b) => b.score - a.score), [q.data, holder]);
  const submit = f.handleSubmit((v) => m.mutate({ id: req.id, userId: v.pick, reason: v.reason }, { onSuccess: () => { f.reset(); onClose(); } }));
  return (
    <FormSheet visible={visible} onClose={onClose} title={t("admCcB.transfer")} onSubmit={() => void submit()} submitLabel={t("admCcB.transferSubmit")} submitting={m.isPending} disabled={!pick}>
      <Text variant="small" tone="gray">{t("admCcB.transferLead")}</Text>
      <QueryBoundary query={q}>
        {list.length ? <View style={{ gap: 10 }}>{list.map((c) => <CandidateRow key={c.userId} c={c} picked={pick === c.userId} onPress={() => f.setValue("pick", c.userId)} />)}</View> : <EmptyState compact icon="users" title={t("admCc.noAdvocates")} />}
      </QueryBoundary>
      <FormInput control={f.control} name="reason" label={t("adm.reason")} placeholder={t("admCcB.transferReasonPh")} />
    </FormSheet>
  );
}
