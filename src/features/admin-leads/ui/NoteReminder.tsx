import { View } from "react-native";
import { Button } from "@/shared/ui";
import { maskDate } from "@/shared/ui/admin";
import { FormInput, useAppForm } from "@/shared/form";
import { useT } from "@/shared/i18n";
import type { Lead } from "@/entities/admin-leads";
import { useLeadActions } from "../model/useLeadActions";
import { leadNoteSchema, reminderSchema } from "../model/leadSchemas";

// Add a note to the lead's history, or schedule a follow-up task for a date.
export function NoteReminder({ lead }: { lead: Lead }) {
  const { t } = useT();
  const { note, reminder } = useLeadActions(lead);
  const nf = useAppForm(leadNoteSchema, { text: "" });
  const rf = useAppForm(reminderSchema, { date: "" });
  const addNote = nf.handleSubmit((v) => note.mutate(v.text, { onSuccess: () => nf.reset() }));
  const addReminder = rf.handleSubmit((v) => reminder.mutate(v.date, { onSuccess: () => rf.reset() }));
  return (
    <View style={{ gap: 12 }}>
      <FormInput control={nf.control} name="text" placeholder={t("admLeads.notePh")} multiline />
      <Button title={t("admLeads.addNote")} icon="send" variant="soft" size="sm" loading={note.isPending} onPress={() => void addNote()} />
      <FormInput control={rf.control} name="date" label={t("admLeads.reminderDate")} format={maskDate} placeholder="2026-10-31" keyboardType="number-pad" maxLength={10} />
      <Button title={t("admLeads.setReminder")} icon="bell" variant="line" size="sm" loading={reminder.isPending} onPress={() => void addReminder()} />
    </View>
  );
}
