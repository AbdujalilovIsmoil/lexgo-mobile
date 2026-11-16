import { Platform, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { isFinal, useMine } from "@/entities/urgent";
import { Icon, PressableScale, Text } from "@/shared/ui";
import { useTheme } from "@/shared/theme";
import { useT } from "@/shared/i18n";

// "Mening so'rovlarim" at the foot of /urgent: one row with how many are still running; it opens the whole list (/urgent/requests).
export function MineLink() {
  const { t } = useT();
  const router = useRouter();
  const { colors: c, dark, glass } = useTheme();
  const rows = useMine().data ?? [];
  const live = rows.filter((r) => !isFinal(r)).length;
  return (
    <PressableScale onPress={() => router.push("/urgent/requests")} scale={0.98} accessibilityRole="button" style={[s.card, { backgroundColor: dark ? c.surface : "#FFFFFF", borderColor: dark ? c.line : "#E6EBF3" }, !glass && s.shadow]}>
      <View style={[s.ico, { backgroundColor: c.tint2 }]}><Icon name="list" size={20} tone="accent" /></View>
      <View style={s.flex}>
        <Text variant="h4" weight="bold" style={s.name}>{t("ug1.mine")}</Text>
        <Text variant="small" tone="gray">{live ? t("ug1.page.activeN", { n: live }) : t("ug1.page.noneActive")}</Text>
      </View>
      <Icon name="chevron-right" size={18} color={c.ink} />
    </PressableScale>
  );
}

const s = StyleSheet.create({
  card: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 14, paddingVertical: 15, borderRadius: 18, borderWidth: 1 },
  ico: { width: 46, height: 46, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  flex: { flex: 1, minWidth: 0, gap: 2 },
  name: { fontSize: 15.5, lineHeight: 21 },
  shadow: Platform.select({ ios: { shadowColor: "#0B1A33", shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 6 } }, default: { elevation: 1 } })!,
});
