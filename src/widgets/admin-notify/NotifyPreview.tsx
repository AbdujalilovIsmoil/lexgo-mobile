import { StyleSheet, View } from "react-native";
import type { Compose } from "@/features/admin-notify";
import { Card, Icon, Text } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";

// How the message will look in the recipient's inbox (title, text, category), updated while typing.
export function NotifyPreview({ compose }: { compose: Compose }) {
  const { t } = useT();
  const c = useColors();
  if (!compose.title.trim() && !compose.body.trim()) return null;
  return (
    <View style={{ gap: 6 }}>
      <Text variant="kicker" tone="gray">{t("admNtfB.preview")}</Text>
      <Card style={s.card}>
        <View style={[s.icon, { backgroundColor: c.tint2 }]}><Icon name="bell" size={18} color={c.accent} /></View>
        <View style={s.fill}>
          <Text variant="body" weight="bold" numberOfLines={2}>{compose.title.trim() || "…"}</Text>
          <Text variant="small" tone="gray" numberOfLines={4}>{compose.body.trim()}</Text>
          <Text variant="caption" tone="gray2">{t(`admNtf.cats.${compose.category}`)}</Text>
        </View>
      </Card>
    </View>
  );
}

const s = StyleSheet.create({
  card: { flexDirection: "row", gap: 12, padding: 14 },
  icon: { width: 40, height: 40, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  fill: { flex: 1, gap: 2 },
});
