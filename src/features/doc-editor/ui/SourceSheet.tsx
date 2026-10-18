import { Text, confirmDialog } from "@/shared/ui";
import { FormSheet } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";
import type { SourceOption } from "@/entities/doc-queue";
import { useSourceFlow } from "../model/useSources";
import { SourceList } from "./SourceList";

type Props = { id: string; visible: boolean; onClose: () => void; onChanged: () => void };

// Switch what the open editor is based on. The old editor session is closed by the backend, so each
// change is confirmed first (the sheet closes before the dialog opens: two modals cannot stack on iOS).
export function SourceSheet({ id, visible, onClose, onChanged }: Props) {
  const { t } = useT();
  const flow = useSourceFlow(id, onChanged, visible);
  const ask = (go: () => void) => {
    onClose();
    setTimeout(() => confirmDialog({ title: t("ad4.switchTitle"), message: t("ad4.switchAsk"), confirmLabel: t("ad4.switchYes"), cancelLabel: t("common.cancel"), icon: "layers", danger: true, onConfirm: go }), 320);
  };
  return (
    <FormSheet visible={visible} onClose={onClose} title={t("ad4.sourceTitle")} snaps={[0.7, 0.94]}>
      <Text variant="small" tone="gray">{t("ad4.sourceLead")}</Text>
      <SourceList flow={flow} onPick={(o: SourceOption) => ask(() => flow.select.mutate(o))} onUpload={() => ask(() => flow.upload.mutate())} />
    </FormSheet>
  );
}
