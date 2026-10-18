import { View } from "react-native";
import type { AdminTask } from "@/entities/admin-tasks";
import { FactRows, FormSheet, StatusPill } from "@/shared/ui/admin";
import { Icon, Text } from "@/shared/ui";
import { fmtDate, fmtDateTime, humanizeSlug } from "@/shared/lib/format";
import { useKept } from "@/shared/lib/useKept";
import { useT } from "@/shared/i18n";

// One workspace task of a professional: facts, description and checklist (read only).
export function AdminTaskSheet({ item, who, onClose }: { item: AdminTask | null; who: string; onClose: () => void }) {
  const { t, locale } = useT();
  const k = useKept(item);
  return (
    <FormSheet visible={!!item} onClose={onClose} title={k?.title ?? ""} subtitle={k?.caseTitle}>
      {k ? (
        <>
          <FactRows rows={[
            { label: t("adm.status"), value: <StatusPill status={k.status} /> }, { label: t("ag4.tasks.priority"), value: humanizeSlug(k.priority) },
            { label: t("ag4.tasks.assignee"), value: who }, { label: t("ag4.tasks.due"), value: fmtDate(k.due, locale) },
            { label: t("adm.created"), value: fmtDateTime(k.createdAt, locale) }, { label: t("adm.updated"), value: fmtDateTime(k.updatedAt, locale) },
          ]} />
          {k.description ? <Text variant="body" selectable>{k.description}</Text> : null}
          {k.checklist.length ? <Text variant="small" tone="gray">{t("ag4.tasks.checklist")}</Text> : null}
          {k.checklist.map((c, i) => (
            <View key={i} style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
              <Icon name={c.done ? "check-circle" : "circle"} size={18} tone={c.done ? "accent" : "gray"} />
              <Text variant="small" style={{ flex: 1 }}>{c.text}</Text>
            </View>
          ))}
        </>
      ) : null}
    </FormSheet>
  );
}
