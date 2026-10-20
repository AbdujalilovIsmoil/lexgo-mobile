import { useState } from "react";
import { View } from "react-native";
import { Button, Chip, DatePickerField, Input, Text, TimePickerField } from "@/shared/ui";
import { FormSheet } from "@/shared/ui/admin";
import { useCreateTask, useEditTask, type Person, type TeamTask } from "@/entities/team-tasks";
import { dayKey, hhmm, toIso } from "@/shared/lib/pro/dates";
import { useT } from "@/shared/i18n";
import { AssigneesSheet } from "./AssigneesSheet";

type Props = { visible: boolean; onClose: () => void; task: TeamTask | null; canAssign: boolean };
const at = (days: number, time: string): { day: string; time: string } => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return { day: dayKey(d.toISOString()), time };
};
const PRESETS = [["today", 0, "18:00"], ["tomorrow", 1, "10:00"], ["days3", 3, "10:00"], ["week", 7, "10:00"]] as const;

// New task, or edit one: the title, a description, the deadline (a date, a time, or a quick pick) and — when creating, if allowed — the
// assignees. The deadline must be in the future; the server's lock_version rides on every edit.
export function TaskFormSheet({ visible, onClose, task, canAssign }: Props) {
  const { t } = useT();
  const create = useCreateTask();
  const edit = useEditTask();
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [day, setDay] = useState("");
  const [time, setTime] = useState("");
  const [people, setPeople] = useState<Person[]>([]);
  const [pick, setPick] = useState(false);
  const [errs, setErrs] = useState<{ title?: string; deadline?: string }>({});
  const [seen, setSeen] = useState(visible);
  if (visible !== seen) {
    setSeen(visible);
    if (visible) {
      setTitle(task?.title ?? "");
      setDesc(task?.description ?? "");
      setDay(task?.deadlineAt ? dayKey(task.deadlineAt) : "");
      setTime(task?.deadlineAt ? hhmm(task.deadlineAt) : "");
      setPeople(task?.assignees ?? []);
      setErrs({});
    }
  }
  const submit = () => {
    const e: typeof errs = {};
    if (!title.trim()) e.title = t("ttm.form.titleNeeded");
    const deadline = day && time ? toIso(day, time) : "";
    if (!deadline) e.deadline = t("ttm.form.deadlineNeeded");
    else if (Date.parse(deadline) <= Date.now() && (!task || deadline !== task.deadlineAt)) e.deadline = t("ttm.form.deadlineFuture");
    setErrs(e);
    if (e.title || e.deadline) return;
    const done = { onSuccess: onClose };
    if (task) edit.mutate({ task, title: title.trim(), description: desc.trim(), deadlineAt: deadline }, done);
    else create.mutate({ title: title.trim(), description: desc.trim(), deadlineAt: deadline, assigneeIds: people.map((p) => p.id) }, done);
  };
  const busy = create.isPending || edit.isPending;
  return (
    <FormSheet visible={visible} onClose={onClose} title={task ? t("ttm.form.editTitle", { code: task.code }) : t("ttm.form.createTitle")} onSubmit={submit} submitLabel={task ? t("ttm.form.save") : t("ttm.form.createBtn")} submitting={busy}>
      <Input label={t("ttm.form.name")} value={title} onChangeText={setTitle} error={errs.title} maxLength={200} />
      <Input label={t("ttm.form.description")} value={desc} onChangeText={setDesc} multiline maxLength={4000} />
      <Text variant="small" tone="gray">{t("ttm.form.deadline")}</Text>
      <View style={{ flexDirection: "row", gap: 10 }}>
        <View style={{ flex: 1 }}><DatePickerField label={t("ttm.form.date")} value={day} onChange={setDay} min={dayKey(new Date().toISOString())} error={errs.deadline} /></View>
        <View style={{ flex: 1 }}><TimePickerField label={t("ttm.form.time")} value={time} onChange={setTime} /></View>
      </View>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {PRESETS.map(([k, d, tm]) => <Chip key={k} label={t(`ttm.form.${k}`)} onPress={() => { const p = at(d, tm); setDay(p.day); setTime(p.time); }} />)}
      </View>
      {!task && canAssign ? (
        <View style={{ gap: 8 }}>
          <Text variant="small" tone="gray">{t("ttm.form.assignees")}</Text>
          <Button title={people.length ? people.map((p) => p.name).join(", ") : t("ttm.form.assigneesPh")} icon="users" variant="line" onPress={() => setPick(true)} />
          {!people.length ? <Text variant="caption" tone="gray2">{t("ttm.form.unassignedHint")}</Text> : null}
        </View>
      ) : null}
      <AssigneesSheet visible={pick} onClose={() => setPick(false)} value={people} onDone={setPeople} />
    </FormSheet>
  );
}
