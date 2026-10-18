import { StyleSheet, View } from "react-native";
import { GradientBox, Icon, Text } from "@/shared/ui";
import { BusinessHoursBadge } from "@/entities/business-hours";
import { useT } from "@/shared/i18n";

// Top of the help centre: a navy gradient card with the title, the lead and today's call-centre hours.
export function SupportHero() {
  const { t } = useT();
  return (
    <GradientBox variant="dark" round={26} style={s.card}>
      <View style={s.glow} pointerEvents="none" />
      <View style={s.ghost} pointerEvents="none"><Icon name="headphones" size={130} color="rgba(255,255,255,0.08)" /></View>
      <View style={s.badge}><Icon name="life-buoy" size={22} color="#00CFE8" /></View>
      <Text variant="h2" tone="white">{t("sp1.hubTitle")}</Text>
      <Text variant="small" style={s.lead}>{t("sp1.hubLead")}</Text>
      <BusinessHoursBadge onDark />
    </GradientBox>
  );
}

const s = StyleSheet.create({
  card: { padding: 20, gap: 8 },
  glow: { position: "absolute", top: -90, right: -60, width: 220, height: 220, borderRadius: 110, backgroundColor: "rgba(0,207,232,0.2)" },
  ghost: { position: "absolute", right: -18, bottom: -26 },
  badge: { width: 46, height: 46, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.12)", alignItems: "center", justifyContent: "center", marginBottom: 4 },
  lead: { color: "#C4DEFF", maxWidth: 300, marginBottom: 6 },
});
