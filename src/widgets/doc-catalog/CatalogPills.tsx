import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/shared/theme";
import { Sparkles, Zap, type LucideIcon } from "lucide-react-native";
import { PressableScale, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";

// The two other ways in, as a quiet pair of outlined pills under the chips (Adliya): the AI intake and urgent help.
export function CatalogPills() {
  const { t } = useT();
  const { colors: c, dark, glass } = useTheme();
  const router = useRouter();
  const box = { backgroundColor: dark || glass ? c.surface : "#FFFFFF", borderColor: dark || glass ? c.line : "#E2E8F1" };
  const pill = (Glyph: LucideIcon, title: string, go: () => void) => (
    <PressableScale onPress={go} scale={0.97} accessibilityRole="button" accessibilityLabel={title} style={[s.pill, box]}>
      <Glyph size={17} color={c.ink} />
      <Text variant="small" weight="semibold" numberOfLines={1} style={[s.txt, { color: c.ink }]}>{title}</Text>
    </PressableScale>
  );
  return (
    <View style={s.row}>
      {pill(Sparkles, t("dcat.quickAi"), () => router.push("/intake"))}
      {pill(Zap, t("dcat.quickUrgent"), () => router.push("/sos"))}
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", flexWrap: "wrap", gap: 10, paddingBottom: 12 },
  pill: { flexDirection: "row", alignItems: "center", gap: 8, minHeight: 40, paddingHorizontal: 16, borderRadius: 999, borderWidth: 1.5 },
  txt: { fontSize: 14.5 },
});
