import { StyleSheet, View } from "react-native";
import { useDemoStore } from "@/entities/admin-dash";
import { useT } from "@/shared/i18n";
import { Card, Icon, Text } from "@/shared/ui";

// Shown while the numbers are demo data, so they are never mistaken for real ones.
export function DemoBanner({ demo }: { demo: boolean }) {
  const { t } = useT();
  const forced = useDemoStore((s) => s.forced);
  if (!demo) return null;
  return (
    <View style={s.wrap}>
      <Card tinted style={s.card}>
        <Icon name="info" size={18} tone="accent" />
        <Text variant="caption" tone="gray" style={s.text}>{forced ? t("admDash.demo.forced") : t("admDash.demo.banner")}</Text>
      </Card>
    </View>
  );
}

const s = StyleSheet.create({ wrap: { paddingHorizontal: 16 }, card: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12 }, text: { flex: 1 } });
