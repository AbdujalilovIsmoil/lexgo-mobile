import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { HeroTopRow } from "@/widgets/home-hero/HeroTopRow";
import { HEADER_GAP, useInsets } from "@/shared/lib/insets";
import { LinearGradient } from "expo-linear-gradient";
import { GradientBox, Icon, PressableScale, Text, type IconName, FocusStatusBar } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { useGrid } from "@/shared/lib/useGrid";
import { Fade } from "./Fade";
import Animated from "react-native-reanimated";

export type HeroStat = { key: string; icon: IconName; tint: string; value: string; label: string; to: string };

// The professional's hero, built like the client's: the same dark gradient with the header row inside it (logo, greeting, tools),
// "Welcome, name", the headline and its line, today's plan, and the four counters — clients, active cases, meetings, documents —
// as gradient tiles of one size in a 2×2 grid; each opens its list.
// The accent follows the role: an advocate gets gold and a licence badge (shield, with the licence number when known), a lawyer
// (yurist) gets violet and a briefcase badge. It colours the glow, the greeting, the plan icon and the badge.
const ACCENT = { advocate: { main: "#F5C451", glow: "rgba(0,207,232,0.18)", chip: "rgba(245,196,81,0.14)" }, lawyer: { main: "#A99BFF", glow: "rgba(169,155,255,0.22)", chip: "rgba(169,155,255,0.16)" } } as const;

export function SellerHero({ name, stats, tasks, meetings, advocate, license }: { name: string; stats: HeroStat[]; tasks: number; meetings: number; advocate: boolean; license?: string }) {
  const { t } = useT();
  const insets = useInsets();
  const router = useRouter();
  const g = useGrid({ count: stats.length });
  const a = ACCENT[advocate ? "advocate" : "lawyer"];
  const badge = `${t(advocate ? "au1.role.advokat" : "au1.role.yurist")}${advocate && license ? ` · ${license}` : ""}`;
  return (
    <GradientBox variant="dark" round={0} style={[s.hero, { paddingTop: insets.top + HEADER_GAP }]}>
      <FocusStatusBar style="light" />
      <View style={[s.glow, { backgroundColor: a.glow }]} pointerEvents="none" />
      <HeroTopRow name={name} />
      <View style={s.hiRow}>
        <Text variant="small" weight="semibold" style={[s.hi, { color: a.main }]}>{t("shm.dash.hi", { name })}</Text>
        <View style={[s.badge, { borderColor: a.main, backgroundColor: a.chip }]} accessible accessibilityLabel={badge}>
          <Icon name={advocate ? "shield" : "briefcase"} size={12} color={a.main} />
          <Text variant="caption" weight="bold" numberOfLines={1} style={{ color: a.main }}>{badge}</Text>
        </View>
      </View>
      <Text variant="hx" tone="white">{t("shm.dash.heroTitle")}</Text>
      <Text variant="lead" style={s.sub}>{t("shm.dash.heroSub")}</Text>
      <View style={s.plan}><Icon name="clock" size={15} color={a.main} /><Text variant="small" style={s.planTx}>{t("shm.dash.greetSub", { meetings, tasks })}</Text></View>
      <View style={s.grid} onLayout={g.onLayout}>
        {g.ready ? stats.map((x, i) => (
          <Animated.View key={x.key} layout={g.move} style={[s.cell, g.cell]}><Fade i={i}>
            <PressableScale onPress={() => router.push(x.to as never)} accessibilityRole="button" accessibilityLabel={`${x.label}: ${x.value}`}>
              <LinearGradient colors={[...(TONES[i % TONES.length])]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.tile}>
                <View style={s.ring} pointerEvents="none" />
                <View style={s.ico}><Icon name={x.icon} size={17} tone="white" /></View>
                <View style={s.foot}>
                  <Text variant="h2" tone="white" numberOfLines={1} adjustsFontSizeToFit>{x.value}</Text>
                  <Text variant="caption" weight="semibold" numberOfLines={2} maxFontSizeMultiplier={1.1} style={s.lbl}>{x.label}</Text>
                </View>
              </LinearGradient>
            </PressableScale>
          </Fade></Animated.View>
        )) : null}
      </View>
    </GradientBox>
  );
}

const TONES: readonly (readonly [string, string])[] = [["#1668F0", "#00CFE8"], ["#7A5CFF", "#B197FC"], ["#00A870", "#5EDDB0"], ["#E0457F", "#FF9AB8"], ["#C2680A", "#F5B455"], ["#0E7FD0", "#7CC7FF"], ["#D6336C", "#FF8787"], ["#12A150", "#7EE0A3"]];

const s = StyleSheet.create({
  hero: { paddingHorizontal: 16, paddingBottom: 22, borderBottomLeftRadius: 28, borderBottomRightRadius: 28, gap: 10 },
  glow: { position: "absolute", top: -120, right: -80, width: 320, height: 320, borderRadius: 160 },
  hiRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 8 },
  hi: { flexShrink: 1 },
  badge: { flexDirection: "row", alignItems: "center", gap: 5, paddingVertical: 3, paddingHorizontal: 9, borderRadius: 999, borderWidth: 1, flexShrink: 0, maxWidth: "55%" },
  sub: { color: "#B7CDEC" },
  plan: { flexDirection: "row", alignItems: "center", gap: 8 },
  planTx: { color: "#C4DEFF", flex: 1 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 6 },
  cell: { width: "48.5%" },
  // Every tile is exactly the same size, like the quick-action tiles: a coloured gradient, a faint ring, the icon chip on top and the
  // number with its label pinned to the bottom.
  tile: { height: 112, padding: 12, borderRadius: 20, justifyContent: "space-between", overflow: "hidden", borderWidth: 1, borderColor: "rgba(255,255,255,0.22)" },
  ring: { position: "absolute", width: 90, height: 90, borderRadius: 45, borderWidth: 11, borderColor: "rgba(255,255,255,0.16)", right: -28, top: -28 },
  ico: { width: 34, height: 34, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.24)", alignItems: "center", justifyContent: "center" },
  foot: { gap: 1 },
  lbl: { color: "rgba(255,255,255,0.92)", fontSize: 11, lineHeight: 14 },
});
