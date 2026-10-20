import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { BottomSheet, Button, Icon, Pill, SheetScroll, Skeleton, Text } from "@/shared/ui";
import { FactRows } from "@/shared/ui/admin";
import { useAssignTask, useMoveTask, useRemoveTask, useTaskHistory, useTeamTask, type TaskStatus, type TeamTask } from "@/entities/team-tasks";
import { AssigneesSheet, ReasonSheet, TaskFormSheet } from "@/features/team-task-form";
import { fmtDateTime, timeAgo } from "@/shared/lib/format";
import { useKept } from "@/shared/lib/useKept";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { dueText } from "./dueText";
import { actKey } from "./TaskRow";

type Dialog = "" | "edit" | "assign" | "return" | "delete";

// One task in full: the status and what was sent back, the facts, who has it, the description, the actions the server allows (the next
// statuses, edit, assignees, delete) and the history. Opened from the list; the list item is shown at once and the fresh one replaces it.
export function TaskDetailSheet({ item, canAssign, onClose }: { item: TeamTask | null; canAssign: boolean; onClose: () => void }) {
  const { t, locale } = useT();
  const c = useColors();
  const base = useKept(item);
  const fresh = useTeamTask(item?.id ?? "").data;
  const history = useTaskHistory(item?.id ?? "").data;
  const move = useMoveTask();
  const assign = useAssignTask();
  const remove = useRemoveTask();
  const [dialog, setDialog] = useState<Dialog>("");
  const task = fresh ?? base;
  const sentBack = task && task.status === "in_progress" ? (history ?? []).find((h) => h.event === "returned") : undefined;
  const go = (to: TaskStatus) => {
    if (!task) return;
    if (task.status === "testing" && to === "in_progress") setDialog("return");
    else move.mutate({ task, to });
  };
  const shut = () => setDialog("");
  return (
    <BottomSheet visible={!!item} onClose={onClose} title={task ? task.code : ""} subtitle={task?.deletedAt ? t("ttm.deleted") : undefined} snaps={[0.8, 0.95]}>
      <SheetScroll>
        {task ? (
          <>
            <Text variant="h4">{task.title}</Text>
            <View style={s.pills}>
              <Pill tone={task.status === "ready" ? "ok" : task.status === "testing" ? "warn" : task.status === "in_progress" ? "blue" : "gray"} label={t(`ttm.status.${task.status}`)} />
              {task.overdue ? <Pill tone="err" icon="alert-circle" label={t("ttm.overdue")} /> : null}
            </View>
            {sentBack?.comment ? (
              <View style={[s.back, { backgroundColor: c.errBg, borderColor: c.err }]}>
                <View style={s.row}><Icon name="rotate-ccw" size={16} color={c.err} /><Text variant="small" weight="bold" style={{ color: c.err }}>{t("ttm.detail.returned")}</Text></View>
                <Text variant="body">{sentBack.comment}</Text>
                <Text variant="caption" tone="gray">{[sentBack.actor?.name, timeAgo(sentBack.createdAt, t)].filter(Boolean).join(" · ")}</Text>
              </View>
            ) : null}
            <FactRows rows={[
              { label: t("ttm.detail.deadline"), value: dueText(task.deadlineAt, t, locale) },
              { label: t("ttm.detail.creator"), value: task.creator?.name },
              { label: t("ttm.detail.updated"), value: fmtDateTime(task.updatedAt, locale) },
              ...(task.readyBy ? [{ label: t("ttm.detail.readyBy"), value: task.readyBy.name }] : []),
              ...(task.deleteReason ? [{ label: t("ttm.detail.deleteReason"), value: task.deleteReason }] : []),
            ]} />
            <View style={{ gap: 6 }}>
              <Text variant="small" tone="gray">{t("ttm.detail.assignees")}</Text>
              {task.assignees.length ? (
                <View style={s.pills}>{task.assignees.map((p) => <Pill key={p.id} small tone="blue" icon="user" label={p.name || p.lexgoId} />)}</View>
              ) : <Text variant="small" weight="semibold" style={{ color: c.warn }}>{t("ttm.unassigned")}</Text>}
            </View>
            <Text variant="body" tone={task.description ? "ink" : "gray"}>{task.description || t("ttm.detail.noDescription")}</Text>
            {!task.deletedAt ? (
              <View style={s.actions}>
                {task.actions.canChangeStatus ? task.actions.next.map((to) => {
                  const k = actKey(task.status, to);
                  return <Button key={to} title={t(`ttm.act.${k}`)} icon={k === "return" ? "rotate-ccw" : "arrow-right"} variant={k === "return" ? "line" : "gradient"} loading={move.isPending && move.variables?.to === to} onPress={() => go(to)} />;
                }) : null}
                {task.actions.canEdit ? <Button title={t("ttm.edit")} icon="edit-2" variant="soft" size="sm" onPress={() => setDialog("edit")} /> : null}
                {task.actions.canAssign ? <Button title={t("ttm.assign")} icon="users" variant="soft" size="sm" onPress={() => setDialog("assign")} /> : null}
                {task.actions.canDelete ? <Button title={t("ttm.delete")} icon="trash-2" variant="line" size="sm" onPress={() => setDialog("delete")} /> : null}
              </View>
            ) : null}
            <View style={{ gap: 8 }}>
              <Text variant="h4">{t("ttm.detail.history")}</Text>
              {history === undefined ? <Skeleton height={60} round={14} /> : !history.length ? <Text variant="small" tone="gray">{t("ttm.detail.noHistory")}</Text> : history.map((h) => (
                <View key={h.id} style={[s.hist, { backgroundColor: c.surface2, borderLeftColor: h.event === "returned" ? c.err : c.accent }]}>
                  <Text variant="small" weight="bold">{t(`ttm.history.${h.event}`)}{h.to ? ` · ${t(`ttm.status.${h.to}`)}` : ""}</Text>
                  {h.comment ? <Text variant="small">{h.comment}</Text> : null}
                  <Text variant="caption" tone="gray">{[h.actor?.name, fmtDateTime(h.createdAt, locale)].filter(Boolean).join(" · ")}</Text>
                </View>
              ))}
            </View>
          </>
        ) : null}
      </SheetScroll>
      <TaskFormSheet visible={dialog === "edit"} onClose={shut} task={task ?? null} canAssign={canAssign} />
      <AssigneesSheet visible={dialog === "assign"} onClose={shut} value={task?.assignees ?? []} title={task ? t("ttm.form.assignTitle", { code: task.code }) : undefined} onDone={(ps) => task && assign.mutate({ task, ids: ps.map((p) => p.id) })} />
      <ReasonSheet visible={dialog === "return"} onClose={shut} title={task ? t("ttm.returnTitle", { code: task.code }) : ""} lead={t("ttm.returnLead")} label={t("ttm.returnLabel")} cta={t("ttm.act.return")} busy={move.isPending} onSubmit={(comment) => task && move.mutate({ task, to: "in_progress", comment }, { onSuccess: shut })} />
      <ReasonSheet visible={dialog === "delete"} onClose={shut} title={task ? t("ttm.deleteTitle", { code: task.code }) : ""} lead={t("ttm.deleteLead")} label={t("ttm.deleteLabel")} cta={t("ttm.delete")} danger busy={remove.isPending} onSubmit={(reason) => task && remove.mutate({ task, reason }, { onSuccess: () => { shut(); onClose(); } })} />
    </BottomSheet>
  );
}

const s = StyleSheet.create({
  pills: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  row: { flexDirection: "row", alignItems: "center", gap: 6 },
  back: { padding: 14, borderRadius: 16, borderWidth: 1, gap: 6 },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  hist: { padding: 12, borderRadius: 14, borderLeftWidth: 4, gap: 2 },
});
