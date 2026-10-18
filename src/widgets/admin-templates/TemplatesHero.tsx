import { StyleSheet, View } from "react-native";
import { Card, Icon, Text } from "@/shared/ui";
import type { Template } from "@/entities/admin-templates";
import { useT } from "@/shared/i18n";

// Headline of the template library: how many, how many are live, how many still drafts, and the live/draft split as one bar.
export function TemplatesHero({ list }: { list: Template[] }) {
  const { t } = useT();
  const live = list.filter((d) => d.isActive).length;
  const draft = list.length - live;
  return (
    <Card style={s.card}>
      <View style={s.top}>
        <View style={s.cell}><Text variant="h2">{list.length}</Text><Text variant="caption" tone="gray">{t("admTplC.total")}</Text></View>
        <View style={s.cell}><View style={s.row}><Icon name="check-circle" size={16} color="#22C55E" /><Text variant="h2">{live}</Text></View><Text variant="caption" tone="gray">{t("admTplC.live")}</Text></View>
        <View style={s.cell}><View style={s.row}><Icon name="edit-3" size={16} color="#F59E0B" /><Text variant="h2">{draft}</Text></View><Text variant="caption" tone="gray">{t("admTplC.draft")}</Text></View>
      </View>
      <View style={s.bar}><View style={{ flex: live, backgroundColor: "#22C55E" }} /><View style={{ flex: draft, backgroundColor: "#F59E0B" }} /></View>
    </Card>
  );
}

const s = StyleSheet.create({
  card: { padding: 14, gap: 12 },
  top: { flexDirection: "row", gap: 8 },
  cell: { flex: 1, gap: 2 },
  row: { flexDirection: "row", alignItems: "center", gap: 6 },
  bar: { flexDirection: "row", height: 12, borderRadius: 6, overflow: "hidden", gap: 2 },
});
