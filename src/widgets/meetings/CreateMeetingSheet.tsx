import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button, Chip, Text } from "@/shared/ui";
import { FormInput, useAppForm, useFieldError } from "@/shared/form";
import { FormSheet } from "@/shared/ui/admin";
import { PeopleSheet, type Person } from "@/entities/person-search";
import type { CallType } from "@/entities/call";
import { MEETING_MINUTES, useCreateMeeting } from "@/features/meeting";
import { useSession } from "@/entities/session";
import { useT } from "@/shared/i18n";
import { meetingSchema } from "./meetingSchema";

// "New meeting": a name, audio or video, how long (15 min by default), the people to invite → Start. Only accounts that
// may start calls (meetings.manage or a call-centre role) get this sheet; everybody can still join meetings they were invited to.
export function CreateMeetingSheet({ visible, onClose, initialType = "video" }: { visible: boolean; onClose: () => void; initialType?: CallType }) {
  const { t } = useT();
  const me = useSession()?.user.id ?? "";
  const f = useAppForm(meetingSchema, { title: "", ids: [] as string[] });
  const tr = useFieldError();
  const [type, setType] = useState<CallType>(initialType);
  const [minutes, setMinutes] = useState(MEETING_MINUTES[0]);
  const [picked, setPicked] = useState<Person[]>([]);
  const pickPeople = (p: Person[]) => { setPicked(p); f.setValue("ids", p.map((u) => u.id), { shouldValidate: true }); };
  // iOS shows one modal at a time: the form steps aside ("wait") while the people list is up, then comes back.
  const [step, setStep] = useState<"form" | "wait" | "people">("form");
  const swap = (to: "form" | "people") => { setStep("wait"); setTimeout(() => setStep(to), 340); };
  const start = useCreateMeeting(() => { onClose(); f.reset({ title: "", ids: [] }); setPicked([]); });
  const submit = f.handleSubmit((v) => start.mutate({ title: v.title, ids: v.ids, type, minutes }));
  return (
    <>
      <FormSheet visible={visible && step === "form"} onClose={() => step === "form" && onClose()} title={t("admMeet.createTitle")} subtitle={t("admMeet.hint")} onSubmit={() => void submit()} submitLabel={t("admMeet.start")} submitting={start.isPending} snaps={[0.75, 0.94]}>
        <FormInput control={f.control} name="title" label={t("admMeet.titleLabel")} placeholder={t("admMeet.titlePh")} maxLength={120} />
        <Text variant="small" tone="gray">{t("ms7.format")}</Text>
        <View style={s.row}>{(["video", "audio"] as const).map((k) => <Chip key={k} icon={k === "video" ? "video" : "phone"} label={t(`admMeet.fmt.${k}`)} active={type === k} onPress={() => setType(k)} />)}</View>
        <Text variant="small" tone="gray">{t("ms7.length")}</Text>
        <View style={s.row}>{MEETING_MINUTES.map((m) => <Chip key={m} label={t("admMeet.minutes", { n: m })} active={minutes === m} onPress={() => setMinutes(m)} />)}</View>
        <View style={s.row}>{picked.map((u) => <Chip key={u.id} icon="x" label={u.name || u.phone} active onPress={() => pickPeople(picked.filter((x) => x.id !== u.id))} />)}</View>
        {f.formState.errors.ids ? <Text variant="small" tone="err">{tr(f.formState.errors.ids.message)}</Text> : null}
        <Button title={picked.length ? t("admMeet.addMore") : t("admMeet.addPeople")} icon="user-plus" variant="soft" onPress={() => swap("people")} />
      </FormSheet>
      <PeopleSheet visible={visible && step === "people"} onClose={() => step === "people" && swap("form")} title={t("admMeet.participants")} me={me} selected={picked} onChange={pickPeople} />
    </>
  );
}

const s = StyleSheet.create({ row: { flexDirection: "row", flexWrap: "wrap", gap: 8 } });
