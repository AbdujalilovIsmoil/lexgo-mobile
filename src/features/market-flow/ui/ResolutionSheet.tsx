import type { ResolutionChoice } from "@/entities/market-flow";
import { FormInput, rules, useAppForm } from "@/shared/form";
import { FormSheet } from "@/shared/ui/admin";
import { toast } from "@/shared/ui";
import { useSheetReset } from "@/shared/lib/useSheetReset";
import { useT } from "@/shared/i18n";
import { useResolution } from "../model/useResolution";

type Props = { orderId: string; choice: ResolutionChoice | null; onClose: () => void };

// Confirms the client's choice (another specialist / a full refund) with an optional note, then sends it once.
export function ResolutionSheet({ orderId, choice, onClose }: Props) {
  const { t } = useT();
  const f = useAppForm(rules.note, { reason: "" });
  useSheetReset(!!choice, () => f.reset({ reason: "" }));
  const send = useResolution(orderId, (a, v) => {
    const key = v.choice === "reassign" ? "mf.res.okReassign" : a.refundStatus === "not_charged" || a.status === "cancelled" ? "mf.res.okCancelled" : "mf.res.okRefund";
    toast(t(key), "ok");
    onClose();
  });
  const c = choice ?? "reassign";
  return (
    <FormSheet
      visible={!!choice}
      onClose={send.isPending ? () => undefined : onClose}
      title={t(`mf.res.${c}`)}
      subtitle={t(`mf.res.${c}Hint`)}
      onSubmit={() => void f.handleSubmit((v) => send.mutate({ choice: c, reason: v.reason ?? "" }))()}
      submitLabel={t("mf.res.confirm")}
      submitting={send.isPending}
      danger={c === "refund"}
      snaps={[0.6, 0.92]}
    >
      <FormInput control={f.control} name="reason" label={t("mf.res.note")} placeholder={t("mf.res.notePh")} multiline maxLength={1000} style={{ minHeight: 96, textAlignVertical: "top" }} />
    </FormSheet>
  );
}
