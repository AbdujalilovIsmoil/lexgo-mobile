import { useLogCall } from "@/entities/admin-callcenter";
import { FormSheet, SelectField } from "@/shared/ui/admin";
import { FormInput, FormPhoneInput, useAppForm } from "@/shared/form";
import { useSheetReset } from "@/shared/lib/useSheetReset";
import { useT } from "@/shared/i18n";
import { logCallSchema } from "../model/ccSchemas";

const RESULTS = ["answered", "no_answer", "busy", "callback", "wrong_number", "note"];
const BLANK = { direction: "outgoing", phone: "", topic: "", result: "answered", minutes: "", next: "", summary: "" };

// Manual call log (POST /call-center/calls); opened from the call log or prefilled from a client card.
export function LogCallSheet({ visible, onClose, phone = "", clientUserId }: { visible: boolean; onClose: () => void; phone?: string; clientUserId?: string }) {
  const { t } = useT();
  const f = useAppForm(logCallSchema, { ...BLANK, phone });
  useSheetReset(visible, () => f.reset({ ...BLANK, phone }));
  const log = useLogCall();
  const [direction, result] = f.watch(["direction", "result"]);
  const submit = f.handleSubmit((v) => {
    // A call nobody answered is a "missed" record; the rest completed.
    const status = v.result === "no_answer" || v.result === "busy" ? "missed" : "completed";
    log.mutate(
      { phone: v.phone, direction: v.direction, status, topic: v.topic, result: v.result, nextAction: v.next, summary: v.summary, durationSec: (Number(v.minutes) || 0) * 60, clientUserId },
      { onSuccess: () => { f.reset({ ...BLANK, phone }); onClose(); } },
    );
  });
  return (
    <FormSheet visible={visible} onClose={onClose} title={t("admCcC.logCall")} onSubmit={() => void submit()} submitLabel={t("admCcC.callSave")} submitting={log.isPending}>
      <SelectField label={t("admCcC.direction")} value={direction} onChange={(x) => f.setValue("direction", x)} options={[{ value: "outgoing", label: t("admCcC.dir2.outgoing") }, { value: "incoming", label: t("admCcC.dir2.incoming") }]} />
      <FormPhoneInput control={f.control} name="phone" label={t("adm.phone")} />
      <FormInput control={f.control} name="topic" label={t("admCcB.topic")} placeholder={t("admCcC.topicPh")} />
      <SelectField label={t("admCc.result")} value={result} onChange={(x) => f.setValue("result", x)} options={RESULTS.map((r) => ({ value: r, label: t(`admCcC.res.${r}`) }))} />
      <FormInput control={f.control} name="minutes" label={t("admCcC.duration")} format={(x) => x.replace(/\D/g, "")} keyboardType="number-pad" placeholder="0" />
      <FormInput control={f.control} name="next" label={t("admCc.nextAction")} placeholder={t("admCcC.nextPh")} />
      <FormInput control={f.control} name="summary" label={t("adm.note")} multiline />
    </FormSheet>
  );
}
