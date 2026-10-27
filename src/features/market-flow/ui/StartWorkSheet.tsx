import { startOrder } from "@/entities/market-flow";
import { FormInput, useAppForm, rules } from "@/shared/form";
import { FormSheet } from "@/shared/ui/admin";
import { useSheetReset } from "@/shared/lib/useSheetReset";
import { toast } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { z } from "zod";
import { useFlowMutation } from "../model/useFlowMutation";

type Props = { visible: boolean; onClose: () => void; orderId: string; startUrl: string };
const schema = z.object({ note: rules.optText(500) });

// TZ §6: the seller starts the work — the order's start action (or status in_progress); the checklist is frozen and the client is told.
// The answer says what comes next: the review stage (study the materials, then set the delivery time) or the work itself.
export function StartWorkSheet({ visible, onClose, orderId, startUrl }: Props) {
  const { t } = useT();
  const f = useAppForm(schema, { note: "" });
  useSheetReset(visible, () => f.reset({ note: "" }));
  const start = useFlowMutation({
    mutationFn: (note: string) => startOrder(orderId, startUrl, note),
    onSuccess: (r) => {
      toast(t(r.workPhase === "reviewing" ? "mf.start.doneReview" : "mf.start.doneTitle"), "ok");
      onClose();
    },
  });
  return (
    <FormSheet visible={visible} onClose={start.isPending ? () => undefined : onClose} title={t("mf.start.confirmTitle")} subtitle={t("mf.start.lead")} onSubmit={() => void f.handleSubmit((v) => start.mutate(v.note))()} submitLabel={t("mf.start.confirm")} submitting={start.isPending} snaps={[0.55, 0.85]}>
      {startUrl ? null : <FormInput control={f.control} name="note" label={t("sl9.noteLabel")} multiline maxLength={500} placeholder={t("sl9.notePh")} />}
    </FormSheet>
  );
}
