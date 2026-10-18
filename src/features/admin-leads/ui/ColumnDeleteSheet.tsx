import { useState } from "react";
import { Text } from "@/shared/ui";
import { FormSheet, SelectField } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";
import { columnTitle, useDeleteColumn, type Column } from "@/entities/admin-leads";

// Delete a status. When it still holds leads they must be moved to another status first.
export function ColumnDeleteSheet({ target, cols, onClose }: { target: Column | null; cols: Column[]; onClose: () => void }) {
  const { t } = useT();
  const del = useDeleteColumn();
  const others = cols.filter((c) => c.key !== target?.key);
  const [seen, setSeen] = useState(target);
  const [to, setTo] = useState("");
  if (target !== seen) {
    setSeen(target);
    setTo(others[0]?.key ?? "");
  }
  const holds = (target?.count ?? 0) > 0;
  return (
    <FormSheet visible={!!target} onClose={onClose} title={t("admLeadsC.deleteStatus")} subtitle={target ? columnTitle(t, target) : ""} danger submitLabel={holds ? t("admLeadsC.moveAndDelete") : t("adm.delete")} submitting={del.isPending} disabled={holds && !to}
      onSubmit={() => target && del.mutate({ key: target.key, reassignTo: holds ? to : undefined }, { onSuccess: onClose })}>
      {holds ? (
        <SelectField label={t("admLeadsC.reassign", { n: target?.count ?? 0 })} value={to} options={others.map((c) => ({ value: c.key, label: columnTitle(t, c) }))} onChange={setTo} />
      ) : (
        <Text variant="body" tone="gray">{t("admLeadsC.deleteStatusText")}</Text>
      )}
    </FormSheet>
  );
}
