import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { HeroTopRow } from "@/widgets/home-hero/HeroTopRow";
import { HEADER_GAP, useInsets } from "@/shared/lib/insets";
import { LinearGradient } from "expo-linear-gradient";
import { GradientBox, Icon, PressableScale, Text, type IconName, FocusStatusBar } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { Fade } from "./Fade";

export type HeroStat = { key: string; icon: IconName; tint: string; value: string; label: string; to: string };

// The professional's hero, built like the client's: the same dark gradient with the header row inside it (logo, greeting, tools),
// "Welcome, name", the headline and its line, today's plan, and the four counters — clients, active cases, meetings, documents —
// as gradient tiles of one size in a 2×2 grid; each opens its list.
export function SellerHero({ name, stats, tasks, meetings }: { name: string; stats: HeroStat[]; tasks: number; meetings: number }) {
  const { t } = useT();
  const insets = useInsets();
  const router = useRouter();
  return (
    <GradientBox variant="dark" round={0} style={[s.hero, { paddingTop: insets.top + HEADER_GAP }]}>
      <FocusStatusBar style="light" />
      <View style={s.glow} pointerEvents="none" />
      <HeroTopRow name={name} />
      <Text variant="small" weight="semibold" style={s.hi}>{t("shm.dash.hi", { name })}</Text>
      <Text variant="hx" tone="white">{t("shm.dash.heroTitle")}</Text>
      <Text variant="lead" style={s.sub}>{t("shm.dash.heroSub")}</Text>
      <View style={s.plan}><Icon name="clock" size={15} color="#00CFE8" /><Text variant="small" style={s.planTx}>{t("shm.dash.greetSub", { meetings, tasks })}</Text></View>
      <View style={s.grid}>
        {stats.map((x, i) => (
          <View key={x.key} style={s.cell}><Fade i={i}>
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
          </Fade></View>
        ))}
      </View>
    </GradientBox>
  );
}

const TONES: readonly (readonly [string, string])[] = [["#1668F0", "#00CFE8"], ["#7A5CFF", "#B197FC"], ["#00A870", "#5EDDB0"], ["#E0457F", "#FF9AB8"], ["#C2680A", "#F5B455"], ["#0E7FD0", "#7CC7FF"], ["#D6336C", "#FF8787"], ["#12A150", "#7EE0A3"]];

const s = StyleSheet.create({
  hero: { paddingHorizontal: 16, paddingBottom: 22, borderBottomLeftRadius: 28, borderBottomRightRadius: 28, gap: 10 },
  glow: { position: "absolute", top: -120, right: -80, width: 320, height: 320, borderRadius: 160, backgroundColor: "rgba(0,207,232,0.18)" },
  hi: { color: "#00CFE8", marginTop: 8 },
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
