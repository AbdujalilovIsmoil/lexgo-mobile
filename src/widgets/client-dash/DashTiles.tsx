import { Platform, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import {
  FileCheck,
  Layers,
  LayoutGrid,
  Search,
  type LucideIcon,
} from "lucide-react-native";
import { useTemplateCategories } from "@/entities/doc-template";
import { PressableScale, Text } from "@/shared/ui";
import { brand, palette, useTheme } from "@/shared/theme";
import { useT } from "@/shared/i18n";

// A tile's icon and the ground behind it are one colour family: the icon a strong step, the ground that family's lightest step.
// The dark themes keep the family as a soft tint of a lighter step, since a pale square would glare on a dark card.
type Tile = {
  key: string;
  icon: LucideIcon;
  color: string;
  tint: string;
  darkColor: string;
  href: string;
};

// The four main ways in, two by two: services, document analysis, ready templates (with the catalogue's count), find a specialist.
const TILES: Tile[] = [
  {
    key: "services",
    icon: LayoutGrid,
    color: brand.b700,
    tint: brand.b50,
    darkColor: brand.b300,
    href: "/(tabs)/services",
  },
  {
    key: "analysis",
    icon: FileCheck,
    color: "#0891B2",
    tint: "#ECFEFF",
    darkColor: brand.cy,
    href: "/doc-analysis",
  },
  {
    key: "templates",
    icon: Layers,
    color: palette.primary500,
    tint: palette.primary50,
    darkColor: palette.primary400,
    href: "/(tabs)/services?docs=1",
  }, // the Hujjatlar catalogue, not the service types
  {
    key: "find",
    icon: Search,
    color: brand.b500,
    tint: brand.b50,
    darkColor: brand.b400,
    href: "/(tabs)/lawyers",
  },
];

export function DashTiles() {
  const { t } = useT();
  const router = useRouter();
  const { colors: c, dark, glass } = useTheme();
  const cats = useTemplateCategories();
  const docs = (cats.data ?? []).reduce((a, x) => a + x.count, 0);
  const sub = (k: string) =>
    k === "templates"
      ? docs
        ? t("cdash.home.templatesSub", { n: docs })
        : t("cdash.home.templatesSub0")
      : t(`cdash.home.${k}Sub`);
  return (
    <View style={s.grid}>
      {TILES.map((x) => (
        <PressableScale
          key={x.key}
          onPress={() => router.navigate(x.href as never)}
          scale={0.97}
          style={[
            s.card,
            {
              backgroundColor: dark ? c.surface : "#FFFFFF",
              borderColor: dark ? c.line : "#EEF2FA",
            },
            glass && noShadow,
          ]}
          accessibilityRole="button"
          accessibilityLabel={t(`cdash.home.${x.key}`)}
        >
          <View
            style={[
              s.ico,
              { backgroundColor: dark ? `${x.darkColor}26` : x.tint },
            ]}
          >
            <x.icon size={22} color={dark ? x.darkColor : x.color} />
          </View>
          <View style={s.copy}>
            <Text
              variant="h4"
              weight="semibold"
              numberOfLines={2}
              maxFontSizeMultiplier={1.15}
              style={s.title}
            >
              {t(`cdash.home.${x.key}`)}
            </Text>
            <Text
              variant="caption"
              weight="regular"
              tone="gray"
              numberOfLines={2}
              maxFontSizeMultiplier={1.15}
              style={s.description}
            >
              {sub(x.key)}
            </Text>
          </View>
        </PressableScale>
      ))}
    </View>
  );
}

export const cardShadow = Platform.select({
  ios: {
    shadowColor: "#1B2A4E",
    shadowOpacity: 0.07,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
  },
  default: { elevation: 2 },
});
// The glass theme's cards are see-through: a shadow would show through them as a dark block (Android elevation), so none there.
export const noShadow = { elevation: 0, shadowOpacity: 0 };

const s = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    paddingHorizontal: 16,
    marginTop: 16,
  },
  card: {
    flexBasis: "47%",
    flexGrow: 1,
    height: 92,
    minHeight: 92,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    overflow: "hidden",
    ...cardShadow,
  },
  ico: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  copy: {
    flex: 1,
    minWidth: 0,
    flexShrink: 1,
    gap: 1,
  },

  title: {
    fontSize: 14,
    lineHeight: 18,
    flexShrink: 1,
  },

  description: {
    fontSize: 12,
    lineHeight: 14,
    flexShrink: 1,
  },
});
