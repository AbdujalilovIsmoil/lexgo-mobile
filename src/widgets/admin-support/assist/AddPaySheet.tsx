import { confirmDialog } from "@/shared/ui";
import { FormSheet } from "@/shared/ui/admin";
import * as rules from "@/shared/form/rules";
import type { AssistOrder } from "@/entities/admin-support";
import { useT } from "@/shared/i18n";
import { AddPayBody } from "./AddPayBody";
import type { ResolveAction } from "./addPayTypes";
import { useAddPayForm } from "./useAddPayForm";
import { useResolveFlow } from "./useResolveFlow";

type Props = { ticketId: string; order: AssistOrder | null; action: ResolveAction; onClose: () => void; onBlock: (e: unknown) => boolean; onRefund: (o: AssistOrder) => void };

// Resolve one supplemental payment: replace the options (backend quote) or start a full/partial refund (Telegram approval).
export function AddPaySheet({ ticketId, order, action, onClose, onBlock, onRefund }: Props) {
  const { t } = useT();
  const replace = action === "replace_options";
  const f = useAddPayForm(order, replace);
  const { quote } = f.rq;
  const done = () => { quote.clear(); f.form.reset(); onClose(); };
  const flow = useResolveFlow(ticketId, order, done, onBlock, onRefund);
  const close = () => { flow.reset(); done(); };
  const submit = () => {
    if (replace) return quote.quote && flow.run({ action, ids: quote.quote.selectedIds });
    void f.form.handleSubmit((v) => {
      if (action === "partial_refund" && !v.amount) return f.form.setError("amount", { message: rules.m("required") });
      const input = action === "partial_refund" ? ({ action, amount: Number(v.amount), reason: v.reason } as const) : ({ action, reason: v.reason } as const);
      confirmDialog({ title: t(`ntd.ccV2.pay.act.${action}`), message: t("ntd.ccV2.pay.confirm"), confirmLabel: t("ntd.ccV2.pay.send"), cancelLabel: t("adm.back"), danger: true, onConfirm: () => flow.run(input) });
    })();
  };
  return (
    <FormSheet visible={!!order} onClose={close} title={t(`ntd.ccV2.pay.act.${action}`)} onSubmit={submit} submitLabel={t("ntd.ccV2.pay.send")} submitting={flow.busy} disabled={replace && !quote.settled}>
      <AddPayBody action={action} f={f} err={flow.err} />
    </FormSheet>
  );
}
