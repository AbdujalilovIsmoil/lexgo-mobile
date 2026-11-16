import { Platform, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { ChevronRight, Gift } from "lucide-react-native";
import { PressableScale, Text } from "@/shared/ui";
import { useReferral } from "@/entities/profile-extras";
import { amber, useTheme } from "@/shared/theme";
import { useT } from "@/shared/i18n";

const MAX_SEGMENTS = 10; // up to this goal the progress is drawn in steps, like the works' step bars; above it, one bar

// ReferralProgress (client side) in the Home card look: "3 invited, 2 more → 25% discount" from GET /referrals/me. A navy gift tile, the
// title and the progress line, the reward as an amber chip, then the friends who joined as step bars with the count.
export function DashReferral() {
  const { t } = useT();
  const { colors: c, dark, glass } = useTheme();
  const router = useRouter();
  const r = useReferral().data;
  if (!r) return null;
  const goal = r.eligibleAfter || 5;
  const joined = Math.min(r.joined, goal);
  const reward = r.discountUnlocked ? t("cdash.ref.unlocked", { pct: r.discountPercent }) : t("cdash.ref.discount", { pct: r.discountPercent || 25 });
  const left = Math.max(0, goal - r.joined);
  const pct = Math.min(100, Math.round((r.joined / Math.max(1, goal)) * 100));
  const done = left === 0;
  const on = done ? c.ok : c.accent;
  const card = { backgroundColor: dark || glass ? c.surface : "#FFFFFF", borderColor: dark || glass ? c.line : "#E6EBF3" };
  return (
    <PressableScale onPress={() => router.navigate("/profile/referral")} scale={0.98} accessibilityRole="button" accessibilityLabel={t("cdash.ref.title")} style={[s.card, card, !glass && s.shadow]}>
      <View style={s.top}>
        <LinearGradient colors={["#13357A", "#0A1F44"]} start={{ x: 0.2, y: 0 }} end={{ x: 0.8, y: 1 }} style={s.ico}>
          <Gift size={22} color="#FFFFFF" />
        </LinearGradient>
        <View style={s.main}>
          <Text variant="h4" numberOfLines={1} maxFontSizeMultiplier={1.15} style={s.title}>{t("cdash.ref.title")}</Text>
          <Text variant="caption" weight="regular" tone="gray" numberOfLines={2} maxFontSizeMultiplier={1.15} style={s.sub}>
            {done ? t("cdash.ref.done", { reward }) : t("cdash.ref.progress", { joined: r.joined, invited: r.invited, remaining: left, reward })}
          </Text>
        </View>
        <View style={[s.go, { backgroundColor: c.tint2 }]}><ChevronRight size={18} color={c.accent} /></View>
      </View>
      <View style={s.bottom}>
        <View style={[s.chip, { backgroundColor: dark ? c.warnBg : amber.bg, borderColor: dark ? "transparent" : amber.line }]}>
          <Text variant="caption" weight="bold" numberOfLines={1} style={{ color: dark ? c.warn : amber.ink, fontSize: 11.5 }}>{reward}</Text>
        </View>
        <View style={s.track}>
          {goal <= MAX_SEGMENTS ? (
            Array.from({ length: goal }, (_, i) => <View key={i} style={[s.seg, { backgroundColor: i < joined ? on : c.line }]} />)
          ) : (
            <View style={[s.seg, { backgroundColor: c.line }]}><View style={[s.fill, { width: `${pct}%`, backgroundColor: on }]} /></View>
          )}
        </View>
        <Text variant="caption" weight="bold" style={[s.count, { color: on }]}>{joined}/{goal}</Text>
      </View>
    </PressableScale>
  );
}

const s = StyleSheet.create({
  card: { marginHorizontal: 16, marginTop: 18, padding: 14, borderRadius: 18, borderWidth: 1, gap: 12 },
  top: { flexDirection: "row", alignItems: "center", gap: 12 },
  ico: { width: 46, height: 46, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  main: { flex: 1, minWidth: 0, gap: 2 },
  title: { fontSize: 15, lineHeight: 20 },
  sub: { fontSize: 12, lineHeight: 16 },
  go: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  bottom: { flexDirection: "row", alignItems: "center", gap: 10 },
  chip: { borderRadius: 999, borderWidth: 1, paddingHorizontal: 9, paddingVertical: 3, maxWidth: "45%" },
  track: { flex: 1, flexDirection: "row", gap: 4 },
  seg: { flex: 1, height: 6, borderRadius: 6, overflow: "hidden" },
  fill: { height: 6, borderRadius: 6 },
  count: { fontSize: 12.5, fontVariant: ["tabular-nums"] },
  shadow: Platform.select({ ios: { shadowColor: "#0B1A33", shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 6 } }, default: { elevation: 1 } })!,
});
