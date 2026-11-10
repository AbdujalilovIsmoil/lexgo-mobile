import type { ReactNode } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Briefcase, ChevronRight, FileCheck, Layers } from "lucide-react-native";
import { kindIcon, kindTint, orderHref } from "@/entities/urgent";
import { useT } from "@/shared/i18n";
import { brand, radius, shadows, useTheme } from "@/shared/theme";
import { Icon, PressableScale, Text } from "@/shared/ui";

const ROAD_ACCIDENT = "traffic_accident_consultation";

type Tile = { key: string; bg: string; icon: ReactNode; title: string; sub: string; onPress: () => void };

// "Boshqa xizmatlar": what the app sells outside the marketplace catalogue (none of it comes with the services above), as one row of tiles
// under the list: the specialists, the document analysis of Home and the road-accident consultation.
export function OtherServices() {
  const { t } = useT();
  const router = useRouter();
  const { colors: c, dark, glass } = useTheme();
  const tone = (light: string) => (dark ? c.accent : light);
  const road = kindTint(ROAD_ACCIDENT);
  const tiles: Tile[] = [
    { key: "lawyers", bg: "#F1EDFF", icon: <Briefcase size={20} color={tone("#7C4DFF")} />, title: t("tabs.svt.lawyersTitle"), sub: t("tabs.svt.lawyersSub"), onPress: () => router.push("/lawyers" as never) },
    { key: "analysis", bg: "#ECFEFF", icon: <FileCheck size={20} color={tone("#0891B2")} />, title: t("cdash.home.analysis"), sub: t("cdash.home.analysisSub"), onPress: () => router.push("/doc-analysis" as never) },
    { key: "accident", bg: `${road}1A`, icon: <Icon name={kindIcon(ROAD_ACCIDENT)} size={20} color={tone(road)} />, title: t("tabs.svt.accidentTitle"), sub: t("tabs.svt.accidentSub"), onPress: () => router.push(orderHref(ROAD_ACCIDENT)) },
  ];
  return (
    <View style={s.wrap}>
      <View style={s.head}>
        <View style={[s.headIco, { backgroundColor: dark ? c.surface2 : "#E6F0FF" }]}><Layers size={17} color={tone("#1668F0")} /></View>
        <Text variant="h4" style={s.headTx}>{t("tabs.svt.more")}</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.rail} contentContainerStyle={s.row}>
        {tiles.map((x) => (
          <PressableScale key={x.key} onPress={x.onPress} scale={0.97} accessibilityRole="button" accessibilityLabel={x.title} style={[s.tile, !glass && shadows.s1, { backgroundColor: dark ? c.surface : brand.white }]}>
            <View style={s.top}>
              <View style={[s.ico, { backgroundColor: dark ? c.surface2 : x.bg }]}>{x.icon}</View>
              <View style={[s.more, { backgroundColor: c.surface2 }]}><ChevronRight size={14} color={c.gray} /></View>
            </View>
            <Text variant="h4" numberOfLines={3} style={s.title}>{x.title}</Text>
            <Text variant="caption" tone="gray" numberOfLines={3} style={s.sub}>{x.sub}</Text>
          </PressableScale>
        ))}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { gap: 10, paddingTop: 12 },
  head: { flexDirection: "row", alignItems: "center", gap: 10 },
  headIco: { width: 32, height: 32, borderRadius: radius.sm, alignItems: "center", justifyContent: "center" },
  headTx: { flex: 1, fontSize: 17, lineHeight: 22 },
  rail: { marginHorizontal: -16 },
  row: { gap: 10, paddingHorizontal: 16, paddingVertical: 4 },
  tile: { width: 156, gap: 6, padding: 12, borderRadius: radius.rl },
  top: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 4 },
  ico: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  more: { width: 24, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 14, lineHeight: 18 },
  sub: { fontSize: 11, lineHeight: 15 },
});
