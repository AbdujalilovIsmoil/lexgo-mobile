import { useState } from "react";
import { useConflictCheck, useCreateClient, type ConflictResult } from "@/entities/pro-clients";
import { FormInput, FormPhoneInput, useAppForm } from "@/shared/form";
import { useT } from "@/shared/i18n";
import { useSheetReset } from "@/shared/lib/useSheetReset";
import { FormSheet } from "@/shared/ui/admin";
import { digits, splitList } from "../model/parse";
import { clientSchema } from "../model/clientSchema";
import { ConflictView } from "./ConflictView";

const EMPTY = { name: "", phone: "", pinfl: "", company: "", opponents: "", reps: "", notes: "" };

// Own-base client (outside LexGo). "Conflict check" compares the entered data before saving.
export function ClientFormSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { t } = useT();
  const f = useAppForm(clientSchema, EMPTY);
  const [res, setRes] = useState<ConflictResult | null>(null);
  useSheetReset(visible, () => (f.reset(EMPTY), setRes(null)));
  const create = useCreateClient();
  const check = useConflictCheck();
  const lists = (v: typeof EMPTY) => ({ opponents: splitList(v.opponents), representatives: splitList(v.reps) });
  const run = () => void f.trigger(["phone", "pinfl"]).then((ok) => {
    const v = f.getValues();
    if (ok) check.mutate({ phone: v.phone, pinfl: v.pinfl, opponent: lists(v).opponents[0], representatives: lists(v).representatives }, { onSuccess: setRes });
  });
  // As on the web: the conflict check runs first (its failure never blocks saving), a match is shown, then the client is saved;
  // after a potential conflict the sheet stays a moment longer so the person can read it.
  const save = f.handleSubmit(async (v) => {
    const l = lists(v);
    const found = await check.mutateAsync({ phone: v.phone, pinfl: v.pinfl, opponent: l.opponents[0], representatives: l.representatives }).catch(() => null);
    setRes(found);
    create.mutate({ name: v.name.trim(), phone: v.phone.trim(), pinfl: v.pinfl, company: v.company, notes: v.notes, ...l }, { onSuccess: () => setTimeout(onClose, found && !found.clear ? 2500 : 0) });
  });
  return (
    <FormSheet visible={visible} onClose={onClose} title={t("aw3.form.title")} subtitle={t("aw3.form.lead")} onSubmit={() => void save()} submitting={create.isPending || check.isPending} secondary={{ label: t("aw3.check"), onPress: run }}>
      <FormInput control={f.control} name="name" label={t("aw3.f.name")} />
      <FormPhoneInput control={f.control} name="phone" label={t("aw3.f.phone")} />
      <FormInput control={f.control} name="pinfl" label={t("aw3.f.pinfl")} format={(x) => digits(x, 14)} keyboardType="number-pad" placeholder={t("aw3.f.pinflPh")} />
      <FormInput control={f.control} name="company" label={t("aw3.f.company")} />
      <FormInput control={f.control} name="opponents" label={t("aw3.f.opponents")} placeholder={t("aw3.f.listPh")} />
      <FormInput control={f.control} name="reps" label={t("aw3.f.reps")} placeholder={t("aw3.f.listPh")} />
      <FormInput control={f.control} name="notes" label={t("aw3.f.notes")} multiline style={{ minHeight: 60, textAlignVertical: "top" }} />
      {res ? <ConflictView r={res} /> : null}
    </FormSheet>
  );
}
