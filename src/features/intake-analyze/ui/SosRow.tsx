import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Icon, PressableScale, Text } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";

// "Shoshilinch bo'lsa — SOS": a full-width red-tinted row (icon tile, label, arrow) to /sos; 56 pt tall.
export function SosRow() {
  const c = useColors();
  const { t } = useT();
  const router = useRouter();
  return (
    <PressableScale onPress={() => router.push("/sos")} accessibilityRole="button" style={[s.row, { backgroundColor: c.errBg }]}>
      <View style={[s.tile, { backgroundColor: c.surface }]}><Icon name="alert-triangle" size={18} color={c.err} /></View>
      <Text variant="body" weight="bold" style={s.flex}>{t("cxIn.orSos")}</Text>
      <Icon name="arrow-right" size={18} color={c.err} />
    </PressableScale>
  );
}

const s = StyleSheet.create({
  row: { minHeight: 56, flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 12, borderRadius: 18 },
  tile: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },
  flex: { flex: 1 },
});
