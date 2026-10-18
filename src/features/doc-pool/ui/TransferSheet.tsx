import { useState } from "react";
import { FormInput, useAppForm, useFieldError } from "@/shared/form";
import { confirmDialog, Input, Skeleton, Text } from "@/shared/ui";
import { FormSheet } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";
import { useSession } from "@/entities/session";
import { useKept } from "@/shared/lib/useKept";
import { useSheetReset } from "@/shared/lib/useSheetReset";
import { useCandidates, type DocReq } from "@/entities/doc-queue";
import { useTransfer } from "../model/useTransfer";
import { transferSchema } from "../model/transferSchema";
import { CandidateRow } from "./CandidateRow";

type Props = { doc: DocReq | null; pool: boolean; onClose: () => void; onDone: () => void };

// Pick another advocate (not yourself, never a client) and hand the request over.
export function TransferSheet({ doc, pool, onClose, onDone }: Props) {
  const { t } = useT();
  const kept = useKept(doc);
  const me = useSession()?.user.id;
  const [q, setQ] = useState("");
  const f = useAppForm(transferSchema, { pick: "", reason: "" });
  const tr = useFieldError();
  const pick = f.watch("pick");
  useSheetReset(!!doc, () => { setQ(""); f.reset({ pick: "", reason: "" }); });
  const cands = useCandidates(!!doc);
  const send = useTransfer(onDone);
  const list = (cands.data ?? []).filter((x) => x.id && x.id !== me && x.name.toLowerCase().includes(q.trim().toLowerCase())).sort((a, b) => Number(b.callCenter) - Number(a.callCenter) || a.workload - b.workload || b.rating - a.rating);
  const target = list.find((x) => x.id === pick);
  const submit = f.handleSubmit((v) => {
    if (!doc || !target) return;
    onClose();
    setTimeout(() => confirmDialog({ title: t("ad2.transferTitle"), message: t("ad2.transferAsk", { name: target.name }), confirmLabel: t("ad2.transferGo"), cancelLabel: t("common.cancel"), icon: "repeat", onConfirm: () => send.mutateAsync({ id: doc.id, targetId: target.id, reason: v.reason, pool }) }), 320);
  });
  return (
    <FormSheet visible={!!doc} onClose={onClose} title={t("ad2.transferTitle")} subtitle={kept?.title} onSubmit={() => void submit()} submitLabel={t("ad2.transferGo")} snaps={[0.8, 0.94]}>
      <Input value={q} onChangeText={setQ} placeholder={t("ad2.searchAdv")} autoCapitalize="none" autoCorrect={false} />
      {cands.isLoading ? [0, 1, 2].map((i) => <Skeleton key={i} height={62} round={16} />) : null}
      {cands.isError ? <Text tone="err">{t("ad2.candFail")}</Text> : null}
      {list.map((x) => <CandidateRow key={x.id} cand={x} picked={x.id === pick} onPress={() => f.setValue("pick", x.id, { shouldValidate: true })} />)}
      {!cands.isLoading && !cands.isError && !list.length ? <Text tone="gray" center>{t("ad2.candNone")}</Text> : null}
      {f.formState.errors.pick ? <Text variant="small" tone="err">{tr(f.formState.errors.pick.message)}</Text> : null}
      <FormInput control={f.control} name="reason" label={t("ad2.reason")} multiline placeholder={t("ad2.reasonPh")} style={{ minHeight: 60, textAlignVertical: "top" }} />
    </FormSheet>
  );
}
