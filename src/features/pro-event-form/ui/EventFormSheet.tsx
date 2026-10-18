import { View } from "react-native";
import { EVENT_TYPES, REMINDERS, useCreateEvent, useDeleteEvent, useUpdateEvent, type CalEvent } from "@/entities/pro-calendar";
import { useCases } from "@/entities/pro-cases";
import { useT } from "@/shared/i18n";
import { tOr } from "@/shared/lib/pro/tOr";
import { useSheetReset } from "@/shared/lib/useSheetReset";
import { FormDate, FormInput, FormTime, useAppForm } from "@/shared/form";
import { confirmDialog } from "@/shared/ui";
import { FormSheet, SelectField, SwitchField } from "@/shared/ui/admin";
import { remindLabel } from "../lib/remind";
import { bodyOf, draftOf } from "../model/draft";
import { eventSchema } from "../model/eventSchema";
import { EventExtras } from "./EventExtras";

type Props = { visible: boolean; onClose: () => void; event: CalEvent | null; day: string; presetCase?: string };

// Create / edit a calendar event in a bottom sheet (delete, .ics export and reminder cascade when editing).
export function EventFormSheet({ visible, onClose, event, day, presetCase }: Props) {
  const { t } = useT();
  const cases = useCases();
  const f = useAppForm(eventSchema, draftOf(event, day, presetCase));
  useSheetReset(visible, () => f.reset(draftOf(event, day, presetCase)));
  const create = useCreateEvent();
  const update = useUpdateEvent();
  const del = useDeleteEvent();
  const submit = f.handleSubmit((v) => {
    const body = bodyOf(v, !!event);
    if (!event) return create.mutate(body, { onSuccess: onClose });
    update.mutate({ id: event.id, ...body, status: v.cancelled ? "cancelled" : "active" }, { onSuccess: onClose });
  });
  const remove = () => event && confirmDialog({ title: t("aw6.deleteTitle"), message: t("aw6.deleteText", { title: event.title }), confirmLabel: t("adm.delete"), cancelLabel: t("adm.cancel"), icon: "trash-2", danger: true, onConfirm: () => del.mutate(event.id, { onSuccess: onClose }) });
  const caseOpts = [{ value: "", label: t("aw6.noCase") }, ...(cases.data ?? []).map((c) => ({ value: c.id, label: c.title || c.number }))];
  return (
    <FormSheet visible={visible} onClose={onClose} title={event ? t("aw6.edit") : t("aw6.add")} onSubmit={() => void submit()} submitting={create.isPending || update.isPending} secondary={event ? { label: t("adm.delete"), onPress: remove } : undefined}>
      <SelectField label={t("aw6.type")} value={f.watch("type")} onChange={(x) => f.setValue("type", x)} options={EVENT_TYPES.map((x) => ({ value: x, label: tOr(t, `aw11.eventType.${x}`, x) }))} />
      <FormInput control={f.control} name="title" label={t("aw6.name")} placeholder={t("aw6.namePh")} maxLength={200} />
      <FormDate control={f.control} name="date" label={t("aw6.date")} />
      <View style={{ flexDirection: "row", gap: 10 }}>
        <View style={{ flex: 1 }}><FormTime control={f.control} name="start" label={t("aw6.start")} /></View>
        <View style={{ flex: 1 }}><FormTime control={f.control} name="end" label={t("aw6.end")} clearable /></View>
      </View>
      <FormInput control={f.control} name="location" label={t("aw6.location")} placeholder={t("aw6.locationPh")} />
      <SelectField label={t("aw6.reminder")} value={f.watch("reminder")} onChange={(x) => f.setValue("reminder", x)} options={REMINDERS.map((m) => ({ value: String(m), label: remindLabel(t, m) }))} />
      <SelectField label={t("aw6.case")} value={f.watch("caseId")} onChange={(x) => f.setValue("caseId", x)} options={caseOpts} searchable />
      {event ? <SwitchField label={t("aw6.cancelled")} value={f.watch("cancelled")} onChange={(x) => f.setValue("cancelled", x)} /> : null}
      {event ? <EventExtras event={event} /> : null}
    </FormSheet>
  );
}
