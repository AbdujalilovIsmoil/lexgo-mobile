import { useAddHoliday } from "@/entities/admin-policies";
import { DateField, Field, FormSheet } from "@/shared/ui/admin";
import { FormInput, useAppForm, useFieldError } from "@/shared/form";
import { useSheetReset } from "@/shared/lib/useSheetReset";
import { useT } from "@/shared/i18n";
import { holidaySchema } from "./calendarSchema";

const EMPTY = { day: "", title: "" };

// Add a public holiday (POST /admin/calendar/holidays). Working-time deadlines skip it from then on.
export function HolidaySheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { t } = useT();
  const tr = useFieldError();
  const add = useAddHoliday();
  const f = useAppForm(holidaySchema, EMPTY);
  useSheetReset(visible, () => f.reset(EMPTY));
  const submit = f.handleSubmit((v) => add.mutate({ day: v.day, title: v.title || t("admPol.holidayDefault") }, { onSuccess: onClose }));
  return (
    <FormSheet visible={visible} onClose={onClose} title={t("admPol.addHoliday")} submitLabel={t("adm.add")} onSubmit={() => void submit()} submitting={add.isPending}>
      <Field error={tr(f.formState.errors.day?.message)}>
        <DateField label={t("adm.date")} value={f.watch("day")} onChange={(x) => f.setValue("day", x, { shouldValidate: true })} />
      </Field>
      <FormInput control={f.control} name="title" label={t("admPol.holidayName")} placeholder={t("admPol.holidayPh")} maxLength={80} />
    </FormSheet>
  );
}
