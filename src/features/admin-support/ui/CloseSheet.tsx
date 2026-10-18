import { useClose, type SupportTicket } from "@/entities/admin-support";
import { FormSheet } from "@/shared/ui/admin";
import { Text } from "@/shared/ui";
import { FormInput, useAppForm } from "@/shared/form";
import { useT } from "@/shared/i18n";
import { closeSchema } from "../model/supportSchemas";

type Props = { ticket: SupportTicket | null; visible: boolean; onClose: () => void };

// Finish the chat with a resolution (required); afterwards only the client can reopen it.
export function CloseSheet({ ticket, visible, onClose }: Props) {
  const { t } = useT();
  const f = useAppForm(closeSchema, { resolution: "" });
  const close = () => { f.reset(); onClose(); };
  const closeTicket = useClose(close);
  const submit = f.handleSubmit((v) => { if (ticket) closeTicket.mutate({ id: ticket.id, resolution: v.resolution }); });
  return (
    <FormSheet visible={visible} onClose={close} title={t("admSup.close")} onSubmit={() => void submit()} submitLabel={t("admSup.closeDo")} submitting={closeTicket.isPending} snaps={[0.62, 0.9]}>
      <Text variant="small" tone="gray">{t("admSup.closeNote")}</Text>
      <FormInput control={f.control} name="resolution" label={t("admSup.resolution")} placeholder={t("admSup.resolutionPh")} multiline />
    </FormSheet>
  );
}
