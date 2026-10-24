import { useState } from "react";
import { createOrderWarranty, useRuntimeCaps, WARRANTY_KINDS, type WarrantyKind, type WarrantyResolution } from "@/entities/market-flow";
import { FormInput, rules, useAppForm } from "@/shared/form";
import { FormSheet, SelectField } from "@/shared/ui/admin";
import { Text } from "@/shared/ui";
import { useSheetReset } from "@/shared/lib/useSheetReset";
import { useT } from "@/shared/i18n";
import { useFlowMutation } from "../model/useFlowMutation";

type Props = { visible: boolean; onClose: () => void; orderId: string; url: string; onSent: () => void };
const FALLBACK: WarrantyResolution[] = ["replacement", "full_refund"];

// TZ §11: the LexGo warranty of one order — what went wrong, what the client asks for (another specialist or a full refund, as the
// platform allows), and the details. It goes to the call center: the screen then says "under review", never an immediate success.
export function OrderWarrantySheet({ visible, onClose, orderId, url, onSent }: Props) {
  const { t } = useT();
  const caps = useRuntimeCaps(visible);
  const choices = caps.data?.warrantyChoices.length ? caps.data.warrantyChoices : FALLBACK;
  const [kind, setKind] = useState<WarrantyKind | "">("");
  const [resolution, setResolution] = useState<WarrantyResolution | "">("");
  const [tried, setTried] = useState(false);
  const f = useAppForm(rules.reason, { reason: "" });
  useSheetReset(visible, () => { f.reset({ reason: "" }); setKind(""); setResolution(""); setTried(false); });
  const send = useFlowMutation({
    mutationFn: (reason: string) => createOrderWarranty(orderId, url, { kind: kind as WarrantyKind, resolution: resolution as WarrantyResolution, reason }),
    onSuccess: () => {
      onClose();
      onSent();
    },
  });
  const submit = () => {
    setTried(true);
    void f.handleSubmit((v) => kind && resolution && send.mutate(v.reason))();
  };
  return (
    <FormSheet visible={visible} onClose={send.isPending ? () => undefined : onClose} title={t("mf.wr.dialogTitle")} subtitle={t("mf.wr.dialogLead")} onSubmit={submit} submitLabel={t("mf.wr.submit")} submitting={send.isPending} snaps={[0.8, 0.95]}>
      <SelectField label={t("mf.wr.whyLabel")} value={kind} onChange={setKind} placeholder={t("mf.wr.pickReason")} error={tried && !kind ? t("mf.wr.pickReason") : undefined} options={WARRANTY_KINDS.map((k) => ({ value: k, label: t(`mf.wr.why.${k}`) }))} />
      <SelectField label={t("mf.wr.resolutionLabel")} value={resolution} onChange={setResolution} error={tried && !resolution ? t("mf.wr.resolutionLabel") : undefined} options={choices.map((r) => ({ value: r, label: t(`mf.wr.resolution.${r}`) }))} />
      <FormInput control={f.control} name="reason" label={t("mf.wr.reasonLabel")} placeholder={t("mf.wr.reasonPh")} multiline maxLength={1000} style={{ minHeight: 100, textAlignVertical: "top" }} />
      <Text variant="caption" tone="gray">{t("mf.wr.reasonHelp")}</Text>
    </FormSheet>
  );
}
