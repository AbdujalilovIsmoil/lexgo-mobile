import { useState } from "react";
import { PeopleSheet, PersonRow, type Person } from "@/entities/person-search";
import type { useTransfer } from "@/features/call";
import { FormSheet } from "@/shared/ui/admin";
import { Button, Text } from "@/shared/ui";
import { FormInput, useAppForm, useFieldError } from "@/shared/form";
import { useT } from "@/shared/i18n";
import { transferSchema } from "./callSchemas";

// Host: hand the work behind this meeting to another advocate. The meeting is put on hold first (and resumed if the
// server refuses); the new assignee gets a realtime notification.
export function TransferSheet({ visible, onClose, me, action }: { visible: boolean; onClose: () => void; me: string; action: ReturnType<typeof useTransfer> }) {
  const { t } = useT();
  const [person, setPerson] = useState<Person | null>(null);
  const f = useAppForm(transferSchema, { lawyerId: "", reason: "" });
  const tr = useFieldError();
  const [pick, setPick] = useState(false);
  const submit = f.handleSubmit((v) => action.mutate(v));
  return (
    <>
      <FormSheet visible={visible} onClose={onClose} title={t("ms6.transfer")} subtitle={t("ms6.transferHint")} onSubmit={() => void submit()} submitLabel={t("ms6.transferSubmit")} submitting={action.isPending} snaps={[0.62, 0.9]}>
        {person ? <PersonRow person={person} selected onPress={() => setPick(true)} /> : <Button title={t("ms6.chooseAdvocate")} icon="user-plus" variant="soft" onPress={() => setPick(true)} />}
        {f.formState.errors.lawyerId ? <Text variant="small" tone="err">{tr(f.formState.errors.lawyerId.message)}</Text> : null}
        <FormInput control={f.control} name="reason" label={t("adm.reason")} placeholder={t("ms6.reasonPh")} maxLength={300} multiline />
        <Text variant="caption" tone="gray">{t("ms6.transferNote")}</Text>
      </FormSheet>
      <PeopleSheet visible={pick} onClose={() => setPick(false)} title={t("ms6.chooseAdvocate")} me={me} onPick={(p) => { setPerson(p); f.setValue("lawyerId", p.id, { shouldValidate: true }); setPick(false); }} />
    </>
  );
}
