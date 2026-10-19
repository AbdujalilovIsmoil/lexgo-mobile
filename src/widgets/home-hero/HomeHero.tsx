import { StyleSheet, View } from "react-native";
import { HEADER_GAP, useInsets } from "@/shared/lib/insets";
import { displayName, useSession } from "@/entities/session";
import { GradientBox, Text, FocusStatusBar } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { HeroRobot } from "./HeroRobot";
import { HeroTitle } from "./HeroTitle";
import { HeroTags } from "./HeroTags";
import { HeroTopRow } from "./HeroTopRow";

// Dark gradient hero (.hero): greeting row, headline, the robot with its bubble, tags.
export function HomeHero() {
  const { t } = useT();
  const insets = useInsets();
  const session = useSession();
  return (
    <GradientBox variant="dark" round={0} style={[s.hero, { paddingTop: insets.top + HEADER_GAP }]}>
      <FocusStatusBar style="light" />
      <View style={s.glow} pointerEvents="none" />
      <HeroTopRow name={displayName(session?.user)} />
      <HeroTitle />
      <Text variant="lead" style={s.sub}>
        {t("home.heroSub")}
      </Text>
      <HeroRobot />
      <HeroTags />
    </GradientBox>
  );
}

const s = StyleSheet.create({
  hero: { paddingHorizontal: 16, paddingBottom: 28, borderBottomLeftRadius: 28, borderBottomRightRadius: 28, gap: 14 },
  glow: { position: "absolute", top: -120, right: -80, width: 320, height: 320, borderRadius: 160, backgroundColor: "rgba(0,207,232,0.18)" },
  sub: { color: "#C4DEFF", maxWidth: 420 },
});
