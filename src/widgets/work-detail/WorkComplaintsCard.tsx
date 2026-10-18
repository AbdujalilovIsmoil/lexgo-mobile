import { StyleSheet, View } from "react-native";
import { WorkStatusPill, useWorkText, type WorkComplaint } from "@/entities/work";
import { useT } from "@/shared/i18n";
import { fmtDateTime } from "@/shared/lib/format";
import { useColors } from "@/shared/theme";
import { Text } from "@/shared/ui";
import { SectionCard } from "@/shared/ui/admin";

// Complaints on this work (a low rating opens one for the call-center): text, status and
// what the operator ruled — free rework, closed with a note, or resolved.
export function WorkComplaintsCard({ items }: { items: WorkComplaint[] }) {
  const c = useColors();
  const { t, locale } = useT();
  const text = useWorkText();
  if (!items.length) return null;
  return (
    <SectionCard title={t("cl5.complaint.title")}>
      {items.map((x, i) => (
        <View key={x.id || i} style={[s.box, { borderColor: c.line }]}>
          <View style={s.head}>
            <Text variant="caption" tone="gray2" style={s.flex}>{x.workId}{x.createdAt ? ` · ${fmtDateTime(x.createdAt, locale)}` : ""}</Text>
            <WorkStatusPill status={x.status} />
          </View>
          {x.text ? <Text variant="small">{x.text}</Text> : null}
          {x.resolvedAction ? <Text variant="small" weight="bold" tone="ok">{text.status(x.resolvedAction)}</Text> : null}
          {x.operatorNote ? <Text variant="small" tone="gray">{t("cl5.complaint.operator")}: {x.operatorNote}</Text> : null}
        </View>
      ))}
    </SectionCard>
  );
}

const s = StyleSheet.create({
  box: { borderWidth: 1, borderRadius: 14, padding: 12, gap: 6 },
  head: { flexDirection: "row", alignItems: "center", gap: 8 },
  flex: { flex: 1 },
});
