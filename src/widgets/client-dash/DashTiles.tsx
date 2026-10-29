import { Platform, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTemplateCategories } from "@/entities/doc-template";
import { PressableScale, Text } from "@/shared/ui";
import { useTheme } from "@/shared/theme";
import { useT } from "@/shared/i18n";

type Glyph = keyof typeof MaterialCommunityIcons.glyphMap;
type Tile = { key: string; icon: Glyph; colors: [string, string]; href: string };

// The four main ways in, two by two: find a specialist, document analysis, ready templates (with the catalogue's count), services.
const TILES: Tile[] = [
  { key: "find", icon: "magnify", colors: ["#4C82F7", "#2F5FD8"], href: "/(tabs)/lawyers" },
  { key: "analysis", icon: "file-check-outline", colors: ["#5CC2DC", "#3196B8"], href: "/doc-analysis" },
  { key: "templates", icon: "view-dashboard-outline", colors: ["#8B6CF2", "#6447D9"], href: "/(tabs)/services" },
  { key: "services", icon: "view-grid-outline", colors: ["#2C4FA3", "#172F72"], href: "/urgent" },
];

export function DashTiles() {
  const { t } = useT();
  const router = useRouter();
  const { colors: c, dark } = useTheme();
  const cats = useTemplateCategories();
  const docs = (cats.data ?? []).reduce((a, x) => a + x.count, 0);
  const sub = (k: string) => (k === "templates" ? (docs ? t("cdash.home.templatesSub", { n: docs }) : t("cdash.home.templatesSub0")) : t(`cdash.home.${k}Sub`));
  return (
    <View style={s.grid}>
      {TILES.map((x) => (
        <PressableScale key={x.key} onPress={() => router.navigate(x.href as never)} scale={0.97} style={[s.card, { backgroundColor: dark ? c.surface : "#FFFFFF", borderColor: dark ? c.line : "#EEF2FA" }]} accessibilityRole="button" accessibilityLabel={t(`cdash.home.${x.key}`)}>
          <MaterialCommunityIcons name={x.icon} size={76} color={x.colors[1]} style={s.ghost} />
          <LinearGradient colors={x.colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.ico}>
            <MaterialCommunityIcons name={x.icon} size={22} color="#FFFFFF" />
          </LinearGradient>
          <View style={s.copy}>
            <Text variant="h4" numberOfLines={2} maxFontSizeMultiplier={1.15} style={s.title}>{t(`cdash.home.${x.key}`)}</Text>
            <Text variant="caption" tone="gray" numberOfLines={2} maxFontSizeMultiplier={1.15}>{sub(x.key)}</Text>
          </View>
        </PressableScale>
      ))}
    </View>
  );
}

export const cardShadow = Platform.select({
  ios: { shadowColor: "#1B2A4E", shadowOpacity: 0.07, shadowRadius: 14, shadowOffset: { width: 0, height: 6 } },
  default: { elevation: 2 },
});

const s = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10, paddingHorizontal: 16, marginTop: 16 },
  card: { flexBasis: "47%", flexGrow: 1, minHeight: 92, borderRadius: 18, borderWidth: 1, padding: 12, flexDirection: "row", alignItems: "center", gap: 10, overflow: "hidden", ...cardShadow },
  ghost: { position: "absolute", right: -14, bottom: -18, opacity: 0.07 },
  ico: { width: 46, height: 46, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  copy: { flex: 1, minWidth: 0, gap: 3 },
  title: { fontSize: 15, lineHeight: 19 },
});
