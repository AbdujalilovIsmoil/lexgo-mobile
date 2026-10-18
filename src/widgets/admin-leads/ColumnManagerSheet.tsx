import { useState } from "react";
import { View } from "react-native";
import { IconButton } from "@/shared/ui";
import { FormSheet, RowCard } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";
import { ColumnDeleteSheet, ColumnFormSheet, isHex, type ColumnTarget } from "@/features/admin-leads";
import { columnTitle, useMoveColumn, type Column } from "@/entities/admin-leads";
import { ColumnMoveButtons } from "./ColumnMoveButtons";

// Statuses (board columns): reorder, rename / recolor, delete (non-final, with a "move leads to…" step) and add.
export function ColumnManagerSheet({ visible, onClose, cols }: { visible: boolean; onClose: () => void; cols: Column[] }) {
  const { t } = useT();
  const [form, setForm] = useState<ColumnTarget | null>(null);
  const [del, setDel] = useState<Column | null>(null);
  const move = useMoveColumn(cols);
  return (
    <FormSheet visible={visible} onClose={onClose} title={t("admLeadsC.manageStatuses")} subtitle={t("cc5.orderHint")} onSubmit={() => setForm({ mode: "add" })} submitLabel={t("admLeadsC.addStatus")} snaps={[0.7, 0.94]}>
      {cols.map((c, i) => (
        <RowCard
          key={c.key}
          icon="circle"
          tint={isHex(c.color) ? c.color : undefined}
          title={columnTitle(t, c)}
          subtitle={c.isFinal ? `${c.count} · ${t("admLeadsC.finalStage")}` : String(c.count)}
          right={
            <View style={{ flexDirection: "row", gap: 4 }}>
              <ColumnMoveButtons first={i === 0} last={i === cols.length - 1} busy={move.isPending} onMove={(dir) => move.mutate({ key: c.key, dir })} />
              <IconButton icon="edit-2" size={34} label={t("adm.edit")} onPress={() => setForm({ mode: "rename", col: c })} />
              {c.isFinal ? null : <IconButton icon="trash-2" size={34} label={t("adm.delete")} onPress={() => setDel(c)} />}
            </View>
          }
        />
      ))}
      <ColumnFormSheet target={form} cols={cols} onClose={() => setForm(null)} />
      <ColumnDeleteSheet target={del} cols={cols} onClose={() => setDel(null)} />
    </FormSheet>
  );
}
