import { Platform, StyleSheet, View } from "react-native";
import { useLawyerCount } from "@/entities/lawyer";
import { useRouter, type Href } from "expo-router";
import { ArrowRight, CarFront, FileCheck, Layers, LayoutGrid, Search, TriangleAlert, type LucideIcon } from "lucide-react-native";
import { useTemplateCategories } from "@/entities/doc-template";
import { PressableScale, Text } from "@/shared/ui";
import { fonts, useTheme } from "@/shared/theme";
import { useT } from "@/shared/i18n";

type Tile = { key: string; icon: LucideIcon; title: string; sub: string; href: Href };

// Adliya's "Xizmatlar" block: the section head (title + "Barchasi" → the services tab), the wide document-analysis card with its AI badge,
// then four ways two by two — online services, specialists (with the directory's count), templates (with the catalogue's count), car accident
// advice — and the red SOS button under them. (Tezkor advokat is the bar's centre tab now.) Every tile opens the same page the old Home tiles did.
export function DashServices() {
  const { t } = useT();
  const router = useRouter();
  const { colors: c, dark, glass } = useTheme();
  const cats = useTemplateCategories();
  const experts = useLawyerCount({}).data ?? 0;
  const docs = (cats.data ?? []).reduce((a, x) => a + x.count, 0);
  const card = { backgroundColor: dark || glass ? c.surface : "#FFFFFF", borderColor: dark || glass ? c.line : "#E6EBF3" };
  const tiles: Tile[] = [
    { key: "services", icon: LayoutGrid, title: t("cdash.home.services"), sub: t("cdash.home.servicesSub"), href: "/(tabs)/services" as Href },
    { key: "find", icon: Search, title: t("cdash.home.findT"), sub: experts ? t("cdash.home.findN", { n: experts }) : t("cdash.home.findSub"), href: "/(tabs)/lawyers" as Href },
    { key: "templates", icon: Layers, title: t("cdash.home.templates"), sub: docs ? t("cdash.home.templatesSub", { n: docs }) : t("cdash.home.templatesSub0"), href: "/(tabs)/services?docs=1" as Href },
    { key: "crash", icon: CarFront, title: t("cdash.home.crashT"), sub: t("cdash.home.crashSub"), href: "/urgent/new?service=traffic_accident_consultation" as Href },
  ];
  return (
    <View style={s.sec}>
      <View style={s.head}>
        <Text variant="h4" style={s.h}>{t("cdash.home.services")}</Text>
        <PressableScale onPress={() => router.navigate("/(tabs)/services")} hitSlop={8}>
          <Text variant="small" weight="bold" tone="accent">{t("cdash.home.all")}</Text>
        </PressableScale>
      </View>
      <PressableScale onPress={() => router.navigate("/doc-analysis")} scale={0.98} style={[s.wide, card, { borderColor: dark || glass ? c.line : "#C9D6F0" }, !glass && s.shadow]} accessibilityRole="button" accessibilityLabel={t("cdash.home.analysis")}>
        <View style={[s.wideIco, { backgroundColor: dark ? c.tint2 : "#0A1F44" }]}><FileCheck size={22} color="#FFFFFF" /></View>
        <View style={s.copy}>
          <View style={s.titleRow}>
            <Text variant="h4" numberOfLines={1} maxFontSizeMultiplier={1.15} style={s.wideT}>{t("cdash.home.analysis")}</Text>
            <View style={[s.badge, { backgroundColor: c.accent }]}><Text style={s.badgeTx} maxFontSizeMultiplier={1}>AI</Text></View>
          </View>
          <Text variant="caption" weight="regular" tone="gray" numberOfLines={2} maxFontSizeMultiplier={1.15} style={s.sub}>{t("cdash.home.analysisLong")}</Text>
        </View>
        <ArrowRight size={18} color={c.gray} />
      </PressableScale>
      <View style={s.grid}>
        {tiles.map((x) => (
          <PressableScale key={x.key} onPress={() => router.navigate(x.href)} scale={0.97} style={[s.tile, card, !glass && s.shadow]} accessibilityRole="button" accessibilityLabel={x.title}>
            <View style={[s.ico, { backgroundColor: c.tint2 }]}><x.icon size={20} color={c.accent} /></View>
            <View style={s.copy}>
              <Text variant="h4" numberOfLines={1} maxFontSizeMultiplier={1.15} style={s.tileT}>{x.title}</Text>
              <Text variant="caption" weight="regular" tone="gray" numberOfLines={1} maxFontSizeMultiplier={1.15} style={s.tileSub}>{x.sub}</Text>
            </View>
          </PressableScale>
        ))}
      </View>
      <PressableScale onPress={() => router.navigate("/sos")} scale={0.98} style={[s.sos, { backgroundColor: c.err }, !glass && s.sosShadow]} accessibilityRole="button" accessibilityLabel={t("cdash.home.sosBar")}>
        <TriangleAlert size={19} color="#FFFFFF" />
        <Text variant="body" weight="bold" numberOfLines={1} maxFontSizeMultiplier={1.15} style={s.sosTx}>{t("cdash.home.sosBar")}</Text>
      </PressableScale>
    </View>
  );
}

const s = StyleSheet.create({
  sec: { paddingHorizontal: 16, marginTop: 22 },
  head: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  h: { fontSize: 17, lineHeight: 22 },
  wide: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 18, borderWidth: 1.5 },
  wideIco: { width: 48, height: 48, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  wideT: { fontSize: 15.5, lineHeight: 20, flexShrink: 1 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  badge: { borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  badgeTx: { color: "#FFFFFF", fontSize: 10, lineHeight: 12, fontFamily: fonts.display },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 10 },
  tile: { flexBasis: "47%", flexGrow: 1, flexDirection: "row", alignItems: "center", gap: 10, padding: 12, minHeight: 66, borderRadius: 18, borderWidth: 1 },
  ico: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  tileSub: { fontSize: 12, lineHeight: 16 },
  sos: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 9, marginTop: 12, minHeight: 52, paddingHorizontal: 16, borderRadius: 14 },
  sosTx: { flexShrink: 1, color: "#FFFFFF", fontSize: 15 },
  sosShadow: Platform.select({ ios: { shadowColor: "#D1343B", shadowOpacity: 0.3, shadowRadius: 12, shadowOffset: { width: 0, height: 6 } }, default: { elevation: 3 } })!,
  copy: { flex: 1, minWidth: 0, gap: 2 },
  tileT: { fontSize: 14.5, lineHeight: 19 },
  sub: { fontSize: 11.5, lineHeight: 15 },
  shadow: Platform.select({ ios: { shadowColor: "#0B1A33", shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 6 } }, default: { elevation: 1 } })!,
});
