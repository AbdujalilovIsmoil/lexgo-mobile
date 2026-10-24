import { fileOrderComplaint } from "@/entities/market-flow";
import { FormInput, rules, useAppForm } from "@/shared/form";
import { FormSheet } from "@/shared/ui/admin";
import { Text } from "@/shared/ui";
import { useSheetReset } from "@/shared/lib/useSheetReset";
import { useT } from "@/shared/i18n";
import { useFlowMutation } from "../model/useFlowMutation";

const MIN = 10;
type Props = { visible: boolean; onClose: () => void; orderId: string; url: string };

// TZ §10: the complaint about a finished order — its own action next to the rating, sent while the backend window is open. The call
// center reviews it and an open complaint holds the seller's settlement.
export function OrderComplaintSheet({ visible, onClose, orderId, url }: Props) {
  const { t } = useT();
  const f = useAppForm(rules.reason, { reason: "" });
  useSheetReset(visible, () => f.reset({ reason: "" }));
  const send = useFlowMutation({ mutationFn: (reason: string) => fileOrderComplaint(orderId, url, reason), success: "mf.cp.pending", onSuccess: onClose });
  return (
    <FormSheet visible={visible} onClose={send.isPending ? () => undefined : onClose} title={t("mf.cp.title")} subtitle={t("mf.cp.lead")} onSubmit={() => void f.handleSubmit((v) => send.mutate(v.reason))()} submitLabel={t("mf.cp.send")} submitting={send.isPending} snaps={[0.62, 0.92]}>
      <FormInput control={f.control} name="reason" placeholder={t("mf.cp.placeholder")} multiline maxLength={1000} style={{ minHeight: 120, textAlignVertical: "top" }} />
      <Text variant="caption" tone="gray">{t("mf.cp.hint", { n: MIN })}</Text>
    </FormSheet>
  );
}
