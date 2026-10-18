import { useReopen, type SupportTicket } from "@/entities/admin-support";
import { FormSheet } from "@/shared/ui/admin";
import { FormInput, useAppForm } from "@/shared/form";
import { useT } from "@/shared/i18n";
import { reopenSchema } from "../model/supportSchemas";

type Props = { ticket: SupportTicket | null; visible: boolean; onClose: () => void };

// Reopen a closed chat (only its own client may: the backend refuses operators). The reason is optional.
export function ReopenSheet({ ticket, visible, onClose }: Props) {
  const { t } = useT();
  const f = useAppForm(reopenSchema, { reason: "" });
  const close = () => { f.reset(); onClose(); };
  const reopen = useReopen(close);
  const submit = f.handleSubmit((v) => { if (ticket) reopen.mutate({ id: ticket.id, reason: v.reason }); });
  return (
    <FormSheet visible={visible} onClose={close} title={t("admSup.reopen")} onSubmit={() => void submit()} submitLabel={t("admSup.reopenDo")} submitting={reopen.isPending} snaps={[0.55, 0.85]}>
      <FormInput control={f.control} name="reason" label={t("admSup.reopenReason")} placeholder={t("admSup.reopenPh")} multiline maxLength={1000} />
    </FormSheet>
  );
}
