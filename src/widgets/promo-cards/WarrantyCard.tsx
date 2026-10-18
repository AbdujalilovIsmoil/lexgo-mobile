import { StyleSheet, View } from "react-native";
import { useColors } from "@/shared/theme";
import { Card, Icon, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";

// Guarantee note (warranty section on the web); tappable when the page wires a drawer to it.
export function WarrantyCard({ onPress }: { onPress?: () => void }) {
  const c = useColors();
  const { t } = useT();
  return (
    <Card tinted onPress={onPress} style={s.card}>
      <View style={[s.icon, { backgroundColor: c.okBg }]}>
        <Icon name="shield" size={22} color={c.ok} />
      </View>
      <View style={s.col}>
        <Text variant="h4">{t("home.warrantyTitle")}</Text>
        <Text variant="small" tone="gray">
          {t("home.warrantySub")}
        </Text>
      </View>
      {onPress ? <Icon name="chevron-right" size={18} tone="gray" /> : null}
    </Card>
  );
}

const s = StyleSheet.create({
  card: { flexDirection: "row", alignItems: "center", gap: 14, marginHorizontal: 16, marginTop: 14 },
  icon: { width: 48, height: 48, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  col: { flex: 1, gap: 3 },
});
