import { useState } from "react";
import { z } from "zod";
import { codeOf, createOrderWarranty, WARRANTY_KINDS, type WarrantyKind } from "@/entities/market-flow";
import { FormInput, rules, useAppForm } from "@/shared/form";
import { FormSheet, SelectField } from "@/shared/ui/admin";
import { Text } from "@/shared/ui";
import { useSheetReset } from "@/shared/lib/useSheetReset";
import { useT } from "@/shared/i18n";
import { useFlowMutation } from "../model/useFlowMutation";

type Props = { visible: boolean; onClose: () => void; orderId: string; url: string; onSent: () => void };
const schema = z.object({ reason: rules.text(5, 1000) });

// The LexGo warranty of one order ("Warranty queue"): what went wrong and the details. The call center decides the outcome (another
// specialist or a full refund), so the client does not pick it; the screen then says "under review", never an immediate success. A claim
// that is already open (409 warranty_already_open) is shown as such.
export function OrderWarrantySheet({ visible, onClose, orderId, url, onSent }: Props) {
  const { t } = useT();
  const [kind, setKind] = useState<WarrantyKind | "">("");
  const [tried, setTried] = useState(false);
  const f = useAppForm(schema, { reason: "" });
  useSheetReset(visible, () => { f.reset({ reason: "" }); setKind(""); setTried(false); });
  const done = () => {
    onClose();
    onSent();
  };
  const send = useFlowMutation({
    mutationFn: (reason: string) => createOrderWarranty(orderId, url, { kind: kind as WarrantyKind, reason }),
    onSuccess: done,
    onError: (e) => {
      if (codeOf(e) === "warranty_already_open") done();
      return false;
    },
  });
  const submit = () => {
    setTried(true);
    void f.handleSubmit((v) => kind && send.mutate(v.reason))();
  };
  return (
    <FormSheet visible={visible} onClose={send.isPending ? () => undefined : onClose} title={t("mf.wr.dialogTitle")} subtitle={t("mf.wr.dialogLead")} onSubmit={submit} submitLabel={t("mf.wr.submit")} submitting={send.isPending} snaps={[0.75, 0.95]}>
      <SelectField label={t("mf.wr.whyLabel")} value={kind} onChange={setKind} placeholder={t("mf.wr.pickReason")} error={tried && !kind ? t("mf.wr.pickReason") : undefined} options={WARRANTY_KINDS.map((k) => ({ value: k, label: t(`mf.wr.why.${k}`) }))} />
      <FormInput control={f.control} name="reason" label={t("mf.wr.reasonLabel")} placeholder={t("mf.wr.reasonPh")} multiline maxLength={1000} style={{ minHeight: 100, textAlignVertical: "top" }} />
      <Text variant="caption" tone="gray">{t("mf.wr.reasonHelp")}</Text>
    </FormSheet>
  );
}
