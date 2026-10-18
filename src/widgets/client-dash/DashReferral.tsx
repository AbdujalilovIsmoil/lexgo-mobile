import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Icon, PressableScale, Text } from "@/shared/ui";
import { useReferral } from "@/entities/profile-extras";
import { gradient, useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";

// ReferralProgress (client side): "3 invited, 2 more → 25% discount" from GET /referrals/me.
export function DashReferral() {
  const { t } = useT();
  const c = useColors();
  const router = useRouter();
  const r = useReferral().data;
  if (!r) return null;
  const goal = r.eligibleAfter || 5;
  const reward = r.discountUnlocked ? t("cdash.ref.unlocked", { pct: r.discountPercent }) : t("cdash.ref.discount", { pct: r.discountPercent || 25 });
  const left = Math.max(0, goal - r.joined);
  const pct = Math.min(100, Math.round((r.joined / Math.max(1, goal)) * 100));
  return (
    <PressableScale onPress={() => router.navigate("/profile/referral")} style={[s.box, { backgroundColor: c.tint, borderColor: c.line }]} accessibilityRole="button">
      <LinearGradient colors={gradient.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.ico}><Icon name="gift" size={19} tone="white" /></LinearGradient>
      <View style={s.main}>
        <Text variant="body" weight="bold">{t("cdash.ref.title")}</Text>
        <Text variant="small" tone="gray">{left > 0 ? t("cdash.ref.progress", { joined: r.joined, invited: r.invited, remaining: left, reward }) : t("cdash.ref.done", { reward })}</Text>
        <View style={s.barRow}><View style={[s.bar, { backgroundColor: c.line }]}><View style={[s.fill, { width: `${pct}%`, backgroundColor: c.accent }]} /></View><Text variant="caption" weight="bold" tone="accent">{Math.min(r.joined, goal)}/{goal}</Text></View>
      </View>
      <Icon name="arrow-right" size={18} tone="gray" />
    </PressableScale>
  );
}

const s = StyleSheet.create({
  box: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 18, borderWidth: 1, marginHorizontal: 16, marginTop: 16 },
  ico: { width: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  main: { flex: 1, gap: 3 },
  barRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 },
  bar: { flex: 1, height: 8, borderRadius: 4, overflow: "hidden" },
  fill: { height: 8, borderRadius: 4 },
});
