import { DueChip, HrmStatus, TASK_STATUSES, prioLabel, stLabel, useNames, type Task } from "@/entities/admin-hrm";
import { useTaskComment, useTaskStatus } from "@/features/admin-hrm";
import { taskActSchema } from "./taskActSchema";
import { FactRows, FormSheet, ProgressBar, SelectField } from "@/shared/ui/admin";
import { Icon, Text } from "@/shared/ui";
import { FormInput, useAppForm } from "@/shared/form";
import { useSheetReset } from "@/shared/lib/useSheetReset";
import { View } from "react-native";
import { fmtDateTime } from "@/shared/lib/format";
import { useKept } from "@/shared/lib/useKept";
import { useT } from "@/shared/i18n";

// One task: facts and checklist; managers (internal_execution.manage) can also change the status and add a comment.
export function TaskSheet({ item: current, onClose, canManage }: { item: Task | null; onClose: () => void; canManage: boolean }) {
  const { t, locale } = useT();
  const item = useKept(current);
  const names = useNames();
  const f = useAppForm(taskActSchema, { status: "", comment: "" });
  useSheetReset(!!current, () => f.reset({ status: "", comment: "" }));
  const [status, comment] = f.watch(["status", "comment"]);
  const setS = useTaskStatus();
  const send = useTaskComment();
  const next = status || item?.status || "";
  const submit = f.handleSubmit(async (v) => {
    if (!item) return;
    if (next !== item.status) await setS.mutateAsync({ id: item.id, status: next });
    if (v.comment) await send.mutateAsync({ id: item.id, body: v.comment });
    f.reset({ status: "", comment: "" });
    onClose();
  });
  const dirty = !!item && (next !== item.status || !!comment.trim());
  return (
    <FormSheet visible={!!current} onClose={onClose} title={item?.title ?? ""} subtitle={item?.code} onSubmit={canManage ? () => void submit() : undefined} disabled={!dirty} submitting={setS.isPending || send.isPending}>
      {item ? (
        <>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" }}><HrmStatus status={item.status} /><DueChip task={item} /></View>
          {item.progress >= 0 ? <ProgressBar value={item.progress / 100} /> : null}
          <FactRows rows={[
            { label: t("adm.status"), value: <HrmStatus status={item.status} /> }, { label: t("admHrmC.priority"), value: prioLabel(t, item.priority) },
            { label: t("admHrmC.project"), value: item.project }, { label: t("adm.assignee"), value: item.responsibleName || names.employee(item.responsibleId) },
            { label: t("admHrmB.unit"), value: names.unit(item.unitId) }, { label: t("admHrmC.deadline"), value: fmtDateTime(item.deadline, locale) },
            { label: t("adm.created"), value: fmtDateTime(item.createdAt, locale) }, { label: t("admHrmC.completed"), value: fmtDateTime(item.completedAt, locale) },
            { label: t("admHrmC.progress"), value: item.progress >= 0 ? `${item.progress}%` : "" },
          ]} />
          {item.description ? <Text variant="small">{item.description}</Text> : null}
          {item.checklist.map((c, i) => (
            <View key={i} style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
              <Icon name={c.done ? "check-circle" : "circle"} size={18} tone={c.done ? "accent" : "gray"} />
              <Text variant="small" style={{ flex: 1 }}>{c.title}</Text>
            </View>
          ))}
          {canManage ? (
            <>
              <SelectField label={t("admHrmC.changeStatus")} value={next} onChange={(v) => f.setValue("status", v)} options={TASK_STATUSES.map((s) => ({ value: s as string, label: stLabel(t, s) }))} />
              <FormInput control={f.control} name="comment" label={t("admHrmC.comment")} multiline maxLength={2000} placeholder={t("admHrmC.commentPh")} />
            </>
          ) : null}
        </>
      ) : null}
    </FormSheet>
  );
}
