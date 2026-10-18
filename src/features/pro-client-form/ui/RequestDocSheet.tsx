import { useRequestDocument } from "@/entities/pro-files";
import { FormInput, useAppForm } from "@/shared/form";
import { useT } from "@/shared/i18n";
import { useSheetReset } from "@/shared/lib/useSheetReset";
import { FormSheet } from "@/shared/ui/admin";
import { requestDocSchema } from "../model/clientSchema";

type Props = { visible: boolean; onClose: () => void; clientId: string; clientName: string };
const EMPTY = { title: "", message: "" };

// Ask a client for a document (POST /workspace/document-requests); they upload the file in reply.
export function RequestDocSheet({ visible, onClose, clientId, clientName }: Props) {
  const { t } = useT();
  const f = useAppForm(requestDocSchema, EMPTY);
  useSheetReset(visible, () => f.reset(EMPTY));
  const req = useRequestDocument();
  const send = f.handleSubmit((v) => req.mutate({ client_user_id: clientId, title: v.title, message: v.message || undefined }, { onSuccess: onClose }));
  return (
    <FormSheet visible={visible} onClose={onClose} title={t("aw3.reqDoc")} subtitle={`${clientName} · ${t("aw3.reqLead")}`} onSubmit={() => void send()} submitting={req.isPending} snaps={[0.55, 0.85]}>
      <FormInput control={f.control} name="title" label={t("aw3.reqTitle")} maxLength={160} />
      <FormInput control={f.control} name="message" label={t("aw3.reqMsg")} multiline style={{ minHeight: 70, textAlignVertical: "top" }} />
    </FormSheet>
  );
}
