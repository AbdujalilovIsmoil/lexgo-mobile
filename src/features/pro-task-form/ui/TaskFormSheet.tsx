import { useCallback, useEffect, useRef } from "react";
import { StyleSheet, type ScrollView } from "react-native";
import { useCases } from "@/entities/pro-cases";
import { useCreateTask, useDeleteTask, useTaskStatus, useUpdateTask, type ProTask, type TaskStage } from "@/entities/pro-tasks";
import { useT } from "@/shared/i18n";
import { useSheetReset } from "@/shared/lib/useSheetReset";
import { FormInput, useAppForm } from "@/shared/form";
import { Icon, PressableScale, Segmented, Text, confirmDialog } from "@/shared/ui";
import { FormSheet, SelectField, SwitchField } from "@/shared/ui/admin";
import { useColors } from "@/shared/theme";
import { draftOf, statusOf, type Draft } from "../model/draft";
import { taskSchema } from "../model/taskSchema";
import { ChecklistEditor } from "./ChecklistEditor";
import { DueField } from "./DueField";
import { FormSection } from "./FormSection";
import { PrioritySegment } from "./PrioritySegment";

type Props = { visible: boolean; onClose: () => void; task: ProTask | null; presetCase?: string };

const MARK = { shouldDirty: true } as const;

// Create / edit a task in a bottom sheet: what (title, description) · plan (priority, due, case) · checklist · and, when editing,
// the stage, the blocked flag and a separate delete. Closing a changed form asks before throwing it away.
export function TaskFormSheet({ visible, onClose, task, presetCase }: Props) {
  const { t } = useT();
  const c = useColors();
  const cases = useCases();
  const f = useAppForm(taskSchema, draftOf(task, presetCase));
  const v = f.watch() as Draft;
  const dirty = f.formState.isDirty;
  useSheetReset(visible, () => f.reset(draftOf(task, presetCase)));
  const create = useCreateTask();
  const update = useUpdateTask();
  const move = useTaskStatus();
  const del = useDeleteTask();
  const scroll = useRef<ScrollView>(null);
  const descY = useRef(0);
  const flag = useRef({ leaving: false }); // set once the user chose to leave (saved, deleted, discarded) so the close guard lets go
  useEffect(() => { if (visible) flag.current.leaving = false; }, [visible]);
  const leave = () => { flag.current.leaving = true; onClose(); };
  const toTop = useCallback(() => scroll.current?.scrollTo({ y: 0, animated: true }), []);
  const guardClose = () => {
    if (flag.current.leaving || !dirty) return false;
    confirmDialog({ title: t("taskForm.discardTitle"), message: t("taskForm.discardText"), confirmLabel: t("taskForm.discard"), cancelLabel: t("taskForm.keep"), icon: "alert-triangle", danger: true, onConfirm: leave });
    return true;
  };
  const submit = () => f.handleSubmit((d) => {
    const linked = cases.data?.find((x) => x.id === d.caseId);
    const pending = d.newItem.trim();
    const checklist = pending ? [...d.checklist, { text: pending, done: false }] : d.checklist;
    const body = {
      title: d.title, priority: d.priority, description: d.description, checklist,
      ...(d.due || task ? { due_date: d.due || null } : {}), ...(d.caseId || task ? { case_id: d.caseId || null, case_title: linked?.title ?? "" } : {}),
    };
    if (!task) return create.mutate(body, { onSuccess: leave });
    update.mutate({ id: task.id, ...body }, {
      onSuccess: () => {
        if (statusOf(d) !== task.status) move.mutate({ id: task.id, status: statusOf(d) });
        leave();
      },
    });
  }, toTop)();
  const remove = () => task && confirmDialog({ title: t("aw7.deleteTitle"), message: t("aw7.deleteText", { title: task.title }), confirmLabel: t("adm.delete"), cancelLabel: t("adm.cancel"), icon: "trash-2", danger: true, onConfirm: () => del.mutate(task.id, { onSuccess: leave }) });
  const set = <K extends keyof Draft>(k: K, x: Draft[K]) => f.setValue(k, x as never, MARK);
  const later = (fn: () => void) => setTimeout(fn, 280); // after the keyboard has lifted (and shrunk) the sheet
  const caseOptions = [{ value: "", label: t("aw7.noCase") }, ...(cases.data ?? []).map((x) => ({ value: x.id, label: x.title || x.number }))];
  const stages: TaskStage[] = ["todo", "doing", "review", "done"];
  const stageLabel = { todo: "stTodo", doing: "stDoing", review: "stReview", done: "stDone" } as const;
  const busy = create.isPending || update.isPending;
  const done = v.checklist.filter((x) => x.done).length;
  return (
    <FormSheet visible={visible} onClose={onClose} guardClose={guardClose} scrollRef={scroll} snaps={[0.8, 0.94]} title={task ? t("aw7.edit") : t("aw7.add")} subtitle={task ? task.title : t("taskForm.subCreate")} onSubmit={() => void submit()} submitting={busy} disabled={!!task && !dirty}>
      <FormSection label={t("taskForm.secWhat")} onLayout={(e) => { descY.current = e.nativeEvent.layout.y; }}>
        <FormInput control={f.control} name="title" placeholder={t("aw7.taskTitlePh")} accessibilityLabel={t("aw7.taskTitle")} maxLength={200} autoFocus={!task} autoCapitalize="sentences" returnKeyType="done" submitBehavior="blurAndSubmit" />
        <FormInput control={f.control} name="description" placeholder={t("taskForm.descPh")} accessibilityLabel={t("aw7.description")} multiline maxLength={2000} autoCapitalize="sentences" style={s.desc} onFocus={() => later(() => scroll.current?.scrollTo({ y: Math.max(0, descY.current - 4), animated: true }))} />
      </FormSection>
      <FormSection label={t("aw7.priority")}>
        <PrioritySegment value={v.priority} onChange={(x) => set("priority", x)} />
      </FormSection>
      <FormSection label={t("aw7.due")}>
        <DueField control={f.control} value={v.due} onPick={(x) => f.setValue("due", x, { shouldDirty: true, shouldValidate: true })} />
      </FormSection>
      <FormSection label={t("taskForm.secCase")}>
        <SelectField value={v.caseId} onChange={(x) => set("caseId", x)} options={caseOptions} searchable />
      </FormSection>
      <FormSection label={t("taskForm.secList")} right={v.checklist.length ? t("taskForm.itemsDone", { done, total: v.checklist.length }) : undefined}>
        <ChecklistEditor items={v.checklist} onChange={(x) => set("checklist", x)} text={v.newItem} onText={(x) => set("newItem", x)} onFocus={() => later(() => scroll.current?.scrollToEnd({ animated: true }))} />
      </FormSection>
      {task ? (
        <>
          <FormSection label={t("taskForm.secStatus")}>
            <Segmented options={stages.map((x) => ({ value: x, label: t(`taskForm.${stageLabel[x]}`) }))} value={v.stage} onChange={(x) => set("stage", x)} />
            <SwitchField label={t("aw7.blocked")} hint={t("aw7.blockedHint")} value={v.blocked} onChange={(x) => set("blocked", x)} />
          </FormSection>
          <FormSection label={t("taskForm.danger")}>
            <PressableScale onPress={remove} accessibilityRole="button" accessibilityLabel={t("adm.delete")} style={[s.del, { backgroundColor: c.errBg, borderColor: c.err }]}>
              <Icon name="trash-2" size={20} color={c.err} />
              <Text variant="small" tone="gray" style={s.hint}>{t("taskForm.deleteHint")}</Text>
              <Text variant="small" weight="semibold" tone="err">{t("adm.delete")}</Text>
            </PressableScale>
          </FormSection>
        </>
      ) : null}
    </FormSheet>
  );
}

const s = StyleSheet.create({
  desc: { minHeight: 84, textAlignVertical: "top" },
  del: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 14, borderWidth: 1 },
  hint: { flex: 1 },
});
