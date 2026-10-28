import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { radius, useColors } from "@/shared/theme";
import { Icon, PressableScale, Text, type IconName } from "@/shared/ui";
import { useT } from "@/shared/i18n";

// The two other ways in, as a quiet pair of pills under the chips (not a hero): the AI intake and urgent help.
export function CatalogPills() {
  const { t } = useT();
  const c = useColors();
  const router = useRouter();
  const pill = (icon: IconName, title: string, color: string, bg: string, go: () => void) => (
    <PressableScale onPress={go} scale={0.97} accessibilityRole="button" accessibilityLabel={title} style={[s.pill, { backgroundColor: bg, borderColor: c.line }]}>
      <Icon name={icon} size={18} color={color} />
      <Text variant="small" weight="bold" numberOfLines={1} style={[s.txt, { color }]}>{title}</Text>
      <Icon name="arrow-right" size={14} color={color} />
    </PressableScale>
  );
  return (
    <View style={s.row}>
      {pill("zap", t("dcat.quickAi"), c.accentStrong, c.tint, () => router.push("/intake"))}
      {pill("alert-triangle", t("dcat.quickUrgent"), c.err, c.errBg, () => router.push("/sos"))}
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", gap: 10, paddingBottom: 12 },
  pill: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8, minHeight: 48, paddingHorizontal: 14, borderRadius: radius.r, borderWidth: 1 },
  txt: { flex: 1 },
});
