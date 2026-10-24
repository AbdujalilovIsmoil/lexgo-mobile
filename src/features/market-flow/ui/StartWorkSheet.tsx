import { startOrder } from "@/entities/market-flow";
import { FormInput, useAppForm, rules } from "@/shared/form";
import { FormSheet } from "@/shared/ui/admin";
import { useSheetReset } from "@/shared/lib/useSheetReset";
import { useT } from "@/shared/i18n";
import { z } from "zod";
import { useFlowMutation } from "../model/useFlowMutation";

type Props = { visible: boolean; onClose: () => void; orderId: string; startUrl: string };
const schema = z.object({ note: rules.optText(500) });

// TZ §9: the seller starts the work — the order's start action (or status in_progress); the checklist is frozen, the deadline starts and
// the client is told. A short note for the client is optional.
export function StartWorkSheet({ visible, onClose, orderId, startUrl }: Props) {
  const { t } = useT();
  const f = useAppForm(schema, { note: "" });
  useSheetReset(visible, () => f.reset({ note: "" }));
  const start = useFlowMutation({ mutationFn: (note: string) => startOrder(orderId, startUrl, note), success: "mf.start.doneTitle", onSuccess: onClose });
  return (
    <FormSheet visible={visible} onClose={start.isPending ? () => undefined : onClose} title={t("mf.start.confirmTitle")} subtitle={t("mf.start.lead")} onSubmit={() => void f.handleSubmit((v) => start.mutate(v.note))()} submitLabel={t("mf.start.confirm")} submitting={start.isPending} snaps={[0.55, 0.85]}>
      {startUrl ? null : <FormInput control={f.control} name="note" label={t("sl9.noteLabel")} multiline maxLength={500} placeholder={t("sl9.notePh")} />}
    </FormSheet>
  );
}
