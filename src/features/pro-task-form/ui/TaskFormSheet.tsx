import { useCases } from "@/entities/pro-cases";
import { STAGES, useCreateTask, useDeleteTask, useTaskStatus, useUpdateTask, type ProTask } from "@/entities/pro-tasks";
import { useT } from "@/shared/i18n";
import { useSheetReset } from "@/shared/lib/useSheetReset";
import { FormInput, useAppForm } from "@/shared/form";
import { confirmDialog } from "@/shared/ui";
import { FormSheet, SelectField, SwitchField, maskDate } from "@/shared/ui/admin";
import { draftOf, statusOf } from "../model/draft";
import { taskSchema } from "../model/taskSchema";
import { ChecklistEditor } from "./ChecklistEditor";

type Props = { visible: boolean; onClose: () => void; task: ProTask | null; presetCase?: string };

// Create / edit a task in a bottom sheet (stage, blocked flag and delete only when editing).
export function TaskFormSheet({ visible, onClose, task, presetCase }: Props) {
  const { t } = useT();
  const cases = useCases();
  const f = useAppForm(taskSchema, draftOf(task, presetCase));
  const v = f.watch();
  useSheetReset(visible, () => f.reset(draftOf(task, presetCase)));
  const create = useCreateTask();
  const update = useUpdateTask();
  const move = useTaskStatus();
  const del = useDeleteTask();
  const submit = f.handleSubmit((d) => {
    const linked = cases.data?.find((c) => c.id === d.caseId);
    const body = {
      title: d.title, priority: d.priority, description: d.description, checklist: d.checklist,
      ...(d.due || task ? { due_date: d.due || null } : {}), ...(d.caseId || task ? { case_id: d.caseId || null, case_title: linked?.title ?? "" } : {}),
    };
    if (!task) return create.mutate(body, { onSuccess: onClose });
    update.mutate({ id: task.id, ...body }, {
      onSuccess: () => {
        if (statusOf(d) !== task.status) move.mutate({ id: task.id, status: statusOf(d) });
        onClose();
      },
    });
  });
  const remove = () => task && confirmDialog({ title: t("aw7.deleteTitle"), message: t("aw7.deleteText", { title: task.title }), confirmLabel: t("adm.delete"), cancelLabel: t("adm.cancel"), icon: "trash-2", danger: true, onConfirm: () => del.mutate(task.id, { onSuccess: onClose }) });
  const caseOptions = [{ value: "", label: t("aw7.noCase") }, ...(cases.data ?? []).map((c) => ({ value: c.id, label: c.title || c.number }))];
  return (
    <FormSheet visible={visible} onClose={onClose} title={task ? t("aw7.edit") : t("aw7.add")} onSubmit={() => void submit()} submitting={create.isPending || update.isPending} secondary={task ? { label: t("adm.delete"), onPress: remove } : undefined}>
      <FormInput control={f.control} name="title" label={t("aw7.taskTitle")} placeholder={t("aw7.taskTitlePh")} maxLength={200} />
      <SelectField label={t("aw7.priority")} value={v.priority} onChange={(x) => f.setValue("priority", x)} options={["low", "medium", "high"].map((p) => ({ value: p, label: t(`aw11.priority.${p}`) }))} />
      <FormInput control={f.control} name="due" label={t("aw7.due")} format={maskDate} placeholder="2026-10-31" keyboardType="number-pad" maxLength={10} />
      <SelectField label={t("aw7.case")} value={v.caseId} onChange={(x) => f.setValue("caseId", x)} options={caseOptions} searchable />
      <FormInput control={f.control} name="description" label={t("aw7.description")} multiline maxLength={2000} style={{ minHeight: 70, textAlignVertical: "top" }} />
      <ChecklistEditor items={v.checklist} onChange={(x) => f.setValue("checklist", x)} />
      {task ? (
        <>
          <SelectField label={t("aw7.stageLabel")} value={v.stage} onChange={(x) => f.setValue("stage", x)} options={STAGES.map((x) => ({ value: x, label: t(`aw7.stage.${x}`) }))} />
          <SwitchField label={t("aw7.blocked")} hint={t("aw7.blockedHint")} value={v.blocked} onChange={(x) => f.setValue("blocked", x)} />
        </>
      ) : null}
    </FormSheet>
  );
}
