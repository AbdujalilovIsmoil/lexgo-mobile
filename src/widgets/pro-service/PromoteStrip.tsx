import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import type { Running } from "@/entities/promotion";
import { gradient, radius, shadows, useColors } from "@/shared/theme";
import { Icon, PressableScale, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";

const GOLD = ["#F4B63F", "#FFD27A"] as const; // the same gold the marketplace gives promoted cards

// What is running, in one word: the profile in the TOP, a boosted service, a banner, or several at once.
export function runningTitleKey(running: Running[]): string {
  const kinds = new Set(running.map((r) => r.placement));
  if (kinds.size > 1) return "proSvc.promoteCta.onMixed";
  const only = [...kinds][0];
  return only === "profile_boost" ? "proSvc.promoteCta.onProfile" : only === "banner" ? "proSvc.promoteCta.onBanner" : "proSvc.promoteCta.onService";
}

// "Promote your profile" as a card of its own, tappable as a whole. While something is running it turns into a green status card
// (what is running, days left) that leads to the promotions screen, so the seller can always tell the boost is on.
export function PromoteStrip({ onPress, running = [] }: { onPress: () => void; running?: Running[] }) {
  const { t } = useT();
  const c = useColors();
  const on = running.length > 0;
  const days = on ? Math.max(...running.map((r) => r.daysLeft)) : 0;
  return (
    <PressableScale onPress={onPress} accessibilityRole="button" accessibilityLabel={on ? `${t(runningTitleKey(running))}, ${t("proSvc.promoteCta.left", { days })}` : t("proSvc.promoteProfile")} style={[s.card, { backgroundColor: c.surface, borderColor: on ? c.ok : "#F4B63F" }, shadows.s1]}>
      <LinearGradient colors={on ? [...gradient.primary] : [...GOLD]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[s.tile, on && { backgroundColor: c.ok }]}>
        <Icon name={on ? "check" : "trending-up"} size={22} color={on ? "#FFFFFF" : "#3A2A00"} />
      </LinearGradient>
      <View style={s.col}>
        <Text variant="body" weight="bold" numberOfLines={1}>{on ? t(runningTitleKey(running)) : t("proSvc.promoteCta.title")}</Text>
        <Text variant="caption" tone={on ? "ok" : "gray"} numberOfLines={1}>{on ? t("proSvc.promoteCta.left", { days }) : t("proSvc.promoteCta.sub")}</Text>
      </View>
      <Icon name="chevron-right" size={20} tone="gray" />
    </PressableScale>
  );
}

const s = StyleSheet.create({
  card: { flexDirection: "row", alignItems: "center", gap: 12, minHeight: 64, paddingHorizontal: 14, paddingVertical: 10, borderRadius: radius.rl, borderWidth: 1.5 },
  tile: { width: 44, height: 44, borderRadius: radius.r, alignItems: "center", justifyContent: "center" },
  col: { flex: 1, gap: 1 },
});
