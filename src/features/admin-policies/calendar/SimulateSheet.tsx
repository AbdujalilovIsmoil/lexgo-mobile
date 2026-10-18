import { useState } from "react";
import { useSimulate } from "@/entities/admin-policies";
import type { Simulation } from "@/entities/admin-policies";
import { DateField, FactRows, Field, FormSheet } from "@/shared/ui/admin";
import { FormInput, useAppForm, useFieldError } from "@/shared/form";
import { Pill } from "@/shared/ui";
import { useSheetReset } from "@/shared/lib/useSheetReset";
import { useT } from "@/shared/i18n";
import { simulateSchema } from "./calendarSchema";
import { maskTime, tashkentText } from "./tashkent";

// "What if an order arrives at …?" — the server computes the advocate's 30-minute deadline for that moment.
export function SimulateSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { t } = useT();
  const sim = useSimulate();
  const tr = useFieldError();
  const f = useAppForm(simulateSchema, { day: "", time: "20:00" });
  const [res, setRes] = useState<Simulation | null>(null);
  useSheetReset(visible, () => setRes(null));
  const wd = (k: string) => t(`admPolB.wd.${k}`);
  const run = f.handleSubmit((v) => sim.mutate(`${v.day}T${v.time}:00+05:00`, { onSuccess: setRes }));
  return (
    <FormSheet visible={visible} onClose={onClose} title={t("admPol.simTitle")} subtitle={t("admPol.simLead")} submitLabel={t("admPol.simRun")} onSubmit={() => void run()} submitting={sim.isPending}>
      <Field error={tr(f.formState.errors.day?.message)}>
        <DateField label={t("adm.date")} value={f.watch("day")} onChange={(x) => f.setValue("day", x, { shouldValidate: true })} />
      </Field>
      <FormInput control={f.control} name="time" label={t("admPol.simTime")} format={maskTime} keyboardType="number-pad" placeholder="20:00" maxLength={5} />
      {res ? (
        <>
          <Pill tone={res.isWorkingTime ? "ok" : "warn"} label={res.isWorkingTime ? t("admPol.simOpen") : res.isWorkingDay ? t("admPol.simAfterHours") : t("admPol.simDayOff")} />
          <FactRows rows={[{ label: t("admPol.simNext"), value: tashkentText(res.nextWorkStart, wd) }, { label: t("admPol.simDeadline"), value: tashkentText(res.deadline30, wd) }]} />
        </>
      ) : null}
    </FormSheet>
  );
}
