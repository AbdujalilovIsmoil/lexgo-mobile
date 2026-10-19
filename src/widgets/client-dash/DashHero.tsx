import { StyleSheet, View } from "react-native";
import { HEADER_GAP, useInsets } from "@/shared/lib/insets";
import { useSession } from "@/entities/session";
import { GradientBox, Text, FocusStatusBar } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { HeroTopRow } from "@/widgets/home-hero/HeroTopRow";
import { DashAsk } from "./DashAsk";
import { DashTrust } from "./DashTrust";
import { DashRail } from "./DashRail";

// .cdhero: greeting, headline, the problem field, trust chips and the rail of the six quick actions.
export function DashHero() {
  const { t } = useT();
  const insets = useInsets();
  const name = useSession()?.user.name;
  return (
    <GradientBox variant="dark" round={0} style={[s.hero, { paddingTop: insets.top + HEADER_GAP }]}>
      <FocusStatusBar style="light" />
      <View style={s.glow} pointerEvents="none" />
      <HeroTopRow name={name} />
      <Text variant="small" weight="semibold" style={s.hi}>{t("cdash.hi", { name: name ?? "" })}</Text>
      <Text variant="hx" tone="white">{t("cdash.heroTitle")}</Text>
      <Text variant="lead" style={s.sub}>{t("cdash.heroSub")}</Text>
      <DashAsk />
      <DashTrust />
      <DashRail />
    </GradientBox>
  );
}

const s = StyleSheet.create({
  hero: { paddingHorizontal: 16, paddingBottom: 24, borderBottomLeftRadius: 28, borderBottomRightRadius: 28, gap: 10 },
  glow: { position: "absolute", top: -120, right: -80, width: 320, height: 320, borderRadius: 160, backgroundColor: "rgba(0,207,232,0.18)" },
  hi: { color: "#00CFE8", marginTop: 8 },
  sub: { color: "#B7CDEC" },
});
