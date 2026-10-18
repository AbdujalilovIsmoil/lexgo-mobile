import { StyleSheet, View } from "react-native";
import { GradientBox, Icon, PressableScale, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { ComplaintSteps } from "./ComplaintSteps";

// Top of the Shikoyatlar tab: a navy gradient card with the lead, the three-step stepper and a big white "new complaint" button.
export function ComplaintsHero({ onNew }: { onNew: () => void }) {
  const { t } = useT();
  return (
    <GradientBox variant="dark" round={26} style={s.card}>
      <View style={s.glow} pointerEvents="none" />
      <View style={s.ghost} pointerEvents="none"><Icon name="message-square" size={130} color="rgba(255,255,255,0.07)" /></View>
      <View style={s.badge}><Icon name="shield" size={22} color="#00CFE8" /></View>
      <Text variant="h2" tone="white">{t("py5.tab.complaints")}</Text>
      <Text variant="small" style={s.lead}>{t("pwc.lead")}</Text>
      <ComplaintSteps />
      <PressableScale onPress={onNew} accessibilityRole="button" style={s.cta}>
        <Icon name="plus" size={18} color="#0B1F45" />
        <Text variant="body" weight="bold" style={s.ctaTx}>{t("pwc.new")}</Text>
      </PressableScale>
    </GradientBox>
  );
}

const s = StyleSheet.create({
  card: { padding: 20, gap: 12 },
  glow: { position: "absolute", top: -90, right: -60, width: 230, height: 230, borderRadius: 115, backgroundColor: "rgba(0,207,232,0.2)" },
  ghost: { position: "absolute", right: -20, bottom: -30 },
  badge: { width: 46, height: 46, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.12)", alignItems: "center", justifyContent: "center" },
  lead: { color: "#C4DEFF" },
  cta: { height: 52, borderRadius: 26, backgroundColor: "#FFFFFF", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 6 },
  ctaTx: { color: "#0B1F45" },
});
