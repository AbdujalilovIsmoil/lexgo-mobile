import { StyleSheet } from "react-native";
import { HEADER_GAP, useInsets } from "@/shared/lib/insets";
import { displayName, useSession } from "@/entities/session";
import { GradientBox, Text, FocusStatusBar } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { HeroTopRow } from "@/widgets/home-hero/HeroTopRow";

// The dark top of Home: header row and the one question. Its bottom edge runs under the middle of the ask field (DashAsk, placed
// right after it with a negative margin), so the field sits half on the hero, half on the page.
export function DashHero() {
  const { t } = useT();
  const insets = useInsets();
  const name = displayName(useSession()?.user);
  return (
    <GradientBox variant="dark" round={0} style={[s.hero, { paddingTop: insets.top + HEADER_GAP }]}>
      <FocusStatusBar style="light" />
      <HeroTopRow name={name} />
      <Text variant="h2" tone="white" style={s.title}>{t("cdash.home.title")}</Text>
    </GradientBox>
  );
}

export const HERO_OVERLAP = 28;

const s = StyleSheet.create({
  hero: { paddingHorizontal: 16, paddingBottom: HERO_OVERLAP + 16, borderBottomLeftRadius: 28, borderBottomRightRadius: 28, gap: 16 },
  title: { fontSize: 27, lineHeight: 32 },
});
