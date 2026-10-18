import { useState } from "react";
import { useConflictCheck, type ConflictResult } from "@/entities/pro-clients";
import { FormInput, FormPhoneInput, useAppForm } from "@/shared/form";
import { useT } from "@/shared/i18n";
import { useSheetReset } from "@/shared/lib/useSheetReset";
import { FormSheet } from "@/shared/ui/admin";
import { digits, splitList } from "../model/parse";
import { conflictSchema } from "../model/clientSchema";
import { ConflictView } from "./ConflictView";

const EMPTY = { phone: "", pinfl: "", opponent: "", reps: "" };

// Stand-alone conflict-of-interest check against the professional's own clients and cases.
export function ConflictSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { t } = useT();
  const f = useAppForm(conflictSchema, EMPTY);
  const [res, setRes] = useState<ConflictResult | null>(null);
  useSheetReset(visible, () => (f.reset(EMPTY), setRes(null)));
  const check = useConflictCheck();
  const run = f.handleSubmit((v) => check.mutate({ phone: v.phone, pinfl: v.pinfl, opponent: v.opponent, representatives: splitList(v.reps) }, { onSuccess: setRes }));
  return (
    <FormSheet visible={visible} onClose={onClose} title={t("aw3.chk.title")} subtitle={t("aw3.chk.lead")} onSubmit={() => void run()} submitLabel={t("aw3.chk.run")} submitting={check.isPending}>
      <FormPhoneInput control={f.control} name="phone" label={t("aw3.f.phone")} />
      <FormInput control={f.control} name="pinfl" label={t("aw3.f.pinfl")} format={(x) => digits(x, 14)} keyboardType="number-pad" placeholder={t("aw3.f.pinflPh")} />
      <FormInput control={f.control} name="opponent" label={t("aw3.chk.opponent")} />
      <FormInput control={f.control} name="reps" label={t("aw3.f.reps")} placeholder={t("aw3.f.listPh")} />
      {res ? <ConflictView r={res} /> : null}
    </FormSheet>
  );
}
