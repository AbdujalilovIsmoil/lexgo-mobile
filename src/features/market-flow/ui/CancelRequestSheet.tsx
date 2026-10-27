import { z } from "zod";
import { requestCancellation } from "@/entities/market-flow";
import { FormInput, rules, useAppForm } from "@/shared/form";
import { FormSheet } from "@/shared/ui/admin";
import { Text } from "@/shared/ui";
import { useSheetReset } from "@/shared/lib/useSheetReset";
import { useT } from "@/shared/i18n";
import { useFlowMutation } from "../model/useFlowMutation";

const schema = z.object({ reason: rules.text(3, 2000) });

type Props = { orderId: string; visible: boolean; onClose: () => void };

// The cancellation contract §4: the client or the current seller asks the call center to cancel a paid order. The reason (3–2000
// characters) goes to the operator; the order then waits in cancellation review with its deadline paused.
export function CancelRequestSheet({ orderId, visible, onClose }: Props) {
  const { t } = useT();
  const f = useAppForm(schema, { reason: "" });
  useSheetReset(visible, () => f.reset({ reason: "" }));
  const send = useFlowMutation({ mutationFn: (reason: string) => requestCancellation(orderId, reason), success: "mf.cr.done", onSuccess: onClose });
  return (
    <FormSheet visible={visible} onClose={send.isPending ? () => undefined : onClose} title={t("mf.cr.title")} subtitle={t("mf.cr.lead")} onSubmit={() => void f.handleSubmit((v) => send.mutate(v.reason))()} submitLabel={t("mf.cr.send")} submitting={send.isPending} danger snaps={[0.6, 0.92]}>
      <FormInput control={f.control} name="reason" label={t("mf.cr.reason")} placeholder={t("mf.cr.reasonPh")} multiline maxLength={2000} style={{ minHeight: 110, textAlignVertical: "top" }} />
      <Text variant="caption" tone="gray">{t("mf.cr.hint")}</Text>
    </FormSheet>
  );
}
