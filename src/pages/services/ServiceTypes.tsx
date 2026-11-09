import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Briefcase, ChevronRight, FileText, GraduationCap, Layers, LayoutGrid, type LucideIcon } from "lucide-react-native";
import { PressableScale, Text } from "@/shared/ui";
import { radius, useTheme } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { ServiceList } from "@/widgets/urgent/ServiceList";
import { TabScrollView, useTabPad } from "@/widgets/tab-page";

type Tile = { key: string; icon: LucideIcon; bg: string; fg: string; title: string; sub: string; onPress: () => void };

// A section's title: the icon on its tile, then the name.
function SectionHead({ icon: Glyph, children }: { icon: LucideIcon; children: ReactNode }) {
  const { colors: c, dark } = useTheme();
  return (
    <View style={s.head}>
      <View style={[s.headIco, { backgroundColor: dark ? c.surface2 : "#E6F0FF" }]}><Glyph size={17} color={dark ? c.accent : "#1668F0"} /></View>
      <Text variant="h4" style={s.headTx}>{children}</Text>
    </View>
  );
}

// "Xizmat turlari": every kind of help the app sells, in one place. First the advocate-on-duty services (video, chat, road accident,
// second opinion — straight from the catalog, with their prices), then the rest as three tiles: the ready-document catalogue, the
// specialists and the academy. Ordering needs an account; the lists themselves are public.
export function ServiceTypes({ onDocs }: { onDocs: () => void }) {
  const { t } = useT();
  const router = useRouter();
  const pad = useTabPad();
  const { colors: c, dark } = useTheme();
  const tiles: Tile[] = [
    { key: "docs", icon: FileText, bg: "#E6F0FF", fg: "#1668F0", title: t("tabs.svt.docsTitle"), sub: t("tabs.svt.docsSub"), onPress: onDocs },
    { key: "lawyers", icon: Briefcase, bg: "#F1EDFF", fg: "#7C4DFF", title: t("tabs.svt.lawyersTitle"), sub: t("tabs.svt.lawyersSub"), onPress: () => router.push("/lawyers" as never) },
    { key: "academy", icon: GraduationCap, bg: "#E3F7EF", fg: "#10A36E", title: t("tabs.svt.academyTitle"), sub: t("tabs.svt.academySub"), onPress: () => router.push("/academy" as never) },
  ];
  return (
    <TabScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 4, gap: 18, paddingBottom: pad }}>
      <ServiceList head={<SectionHead icon={LayoutGrid}>{t("tabs.svt.main")}</SectionHead>} />
      <View style={s.wrap}>
        <SectionHead icon={Layers}>{t("tabs.svt.more")}</SectionHead>
        <View style={s.tiles}>
          {tiles.map(({ key, icon: Glyph, bg, fg, title, sub, onPress }) => (
            <PressableScale key={key} onPress={onPress} scale={0.97} accessibilityRole="button" style={[s.tile, { backgroundColor: c.surface, borderColor: c.line }]}>
              <View style={s.tileTop}>
                <View style={[s.ico, { backgroundColor: dark ? c.surface2 : bg }]}><Glyph size={20} color={dark ? c.accent : fg} /></View>
                <View style={[s.more, { backgroundColor: c.surface2 }]}><ChevronRight size={14} color={c.gray} /></View>
              </View>
              <Text variant="h4" numberOfLines={2} style={s.title}>{title}</Text>
              <Text variant="caption" tone="gray" numberOfLines={4} style={s.sub}>{sub}</Text>
            </PressableScale>
          ))}
        </View>
      </View>
    </TabScrollView>
  );
}

const s = StyleSheet.create({
  wrap: { gap: 10 },
  head: { flexDirection: "row", alignItems: "center", gap: 10 },
  headIco: { width: 32, height: 32, borderRadius: radius.sm, alignItems: "center", justifyContent: "center" },
  headTx: { flex: 1, fontSize: 17, lineHeight: 22 },
  tiles: { flexDirection: "row", gap: 8 },
  tile: { flex: 1, minWidth: 0, gap: 6, padding: 12, borderRadius: radius.rl, borderWidth: 1 },
  tileTop: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 4 },
  ico: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  more: { width: 24, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 14, lineHeight: 18 },
  sub: { fontSize: 11, lineHeight: 15 },
});
