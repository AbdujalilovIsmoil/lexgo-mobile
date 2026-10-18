import { FormInput, useAppForm } from "@/shared/form";
import { FormSheet } from "@/shared/ui/admin";
import { useSheetReset } from "@/shared/lib/useSheetReset";
import { useT } from "@/shared/i18n";
import { columnTitle, useSaveColumn, type Column } from "@/entities/admin-leads";
import { STATUS_COLORS, columnKey } from "../model/columnKey";
import { columnSchema } from "../model/leadSchemas";
import { ColorPicker } from "./ColorPicker";

export type ColumnTarget = { mode: "add" } | { mode: "rename"; col: Column };

// Add a status, or rename / recolor an existing one (the key never changes).
export function ColumnFormSheet({ target, cols, onClose }: { target: ColumnTarget | null; cols: Column[]; onClose: () => void }) {
  const { t } = useT();
  const save = useSaveColumn();
  const f = useAppForm(columnSchema, { name: "", color: STATUS_COLORS[0] });
  useSheetReset(!!target, () => f.reset({ name: target?.mode === "rename" ? columnTitle(t, target.col) : "", color: target?.mode === "rename" ? target.col.color || "#6b7280" : STATUS_COLORS[0] }));
  const submit = f.handleSubmit((v) => {
    if (!target) return;
    // Left as shown, a default stage keeps its raw title (and stays translated).
    const title = target.mode === "rename" && v.name === columnTitle(t, target.col) ? target.col.title : v.name;
    const order = cols.reduce((m, c) => Math.max(m, c.order), 0) + 10;
    const next = target.mode === "add" ? { key: columnKey(title, cols), title, color: v.color, order, isFinal: false } : { key: target.col.key, title, color: v.color, order: target.col.order, isFinal: target.col.isFinal };
    save.mutate(next, { onSuccess: onClose });
  });
  return (
    <FormSheet visible={!!target} onClose={onClose} title={target?.mode === "rename" ? t("admLeadsC.renameStatus") : t("admLeadsC.addStatus")} onSubmit={() => void submit()} submitting={save.isPending}>
      <FormInput control={f.control} name="name" label={t("admLeadsC.statusName")} placeholder={t("admLeadsC.statusNamePh")} autoFocus />
      <ColorPicker value={f.watch("color")} onChange={(v) => f.setValue("color", v, { shouldValidate: true })} />
    </FormSheet>
  );
}
