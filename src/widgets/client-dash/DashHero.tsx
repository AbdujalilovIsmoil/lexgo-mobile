import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { HEADER_GAP, HEADER_ROW, useInsets } from "@/shared/lib/insets";
import { displayName, useSession } from "@/entities/session";
import { Text, FocusStatusBar } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { HeroTopRow } from "@/widgets/home-hero/HeroTopRow";

// The dark top of Home: a deep navy band behind the status bar and the header row, then the brighter blue under it with the one question.
// Its bottom edge runs under the middle of the ask field (DashAsk, placed right after it with a negative margin), so the field sits half on
// the hero, half on the page; a soft light glows behind the field.
export function DashHero() {
  const { t } = useT();
  const insets = useInsets();
  const name = displayName(useSession()?.user);
  const band = insets.top + HEADER_GAP + HEADER_ROW + 10;
  return (
    <LinearGradient colors={["#1A3784", "#1F46A3", "#2756BB"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[s.hero, { paddingTop: insets.top + HEADER_GAP }]}>
      <FocusStatusBar style="light" />
      <View pointerEvents="none" style={[s.band, { height: band }]} />
      <LinearGradient pointerEvents="none" colors={["rgba(130,180,255,0)", "rgba(130,180,255,0.30)"]} style={s.glow} />
      <HeroTopRow name={name} demo={false} />
      <Text variant="h2" tone="white" style={s.title}>{t("cdash.home.title")}</Text>
    </LinearGradient>
  );
}

export const HERO_OVERLAP = 28;

const s = StyleSheet.create({
  hero: { paddingHorizontal: 16, paddingBottom: HERO_OVERLAP + 16, borderBottomLeftRadius: 28, borderBottomRightRadius: 28, gap: 22, overflow: "hidden" },
  band: { position: "absolute", top: 0, left: 0, right: 0, backgroundColor: "#0F2152" },
  glow: { position: "absolute", bottom: 0, left: 0, right: 0, height: 80 },
  title: { fontSize: 27, lineHeight: 32 },
});
