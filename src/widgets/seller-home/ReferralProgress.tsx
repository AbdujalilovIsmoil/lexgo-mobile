import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { commissionLadder } from "@/entities/pro-workspace";
import { useReferral } from "@/entities/pro-referrals";
import { brand, gradient, radius, shadows } from "@/shared/theme";
import { Icon, PressableScale, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { Fade } from "./Fade";

// "Do'stlarni taklif qiling": a gradient card with the progress as a row of dots (one per colleague needed, filled as they join)
// and the line "N more → commission X %". A tap opens the referral page. It waits for the real referral data.
export function ReferralProgress({ i }: { i: number }) {
  const { t } = useT();
  const router = useRouter();
  const r = useReferral().data;
  if (!r) return null;
  const { now, goal, next } = commissionLadder(r.joined);
  const left = Math.max(0, goal - r.joined);
  const reward = next ? t("shm.rp.commission", { pct: next }) : t("shm.rp.maxTier");
  return (
    <Fade i={i}>
      <PressableScale onPress={() => router.push("/pro/referrals" as never)} accessibilityRole="button" accessibilityLabel={t("shm.rp.title")}>
        <LinearGradient colors={[...gradient.primary]} locations={[...gradient.primaryStops]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[s.card, shadows.blue]}>
          <View style={s.ring} pointerEvents="none" />
          <View style={s.head}>
            <View style={s.ico}><Icon name="gift" size={20} tone="white" /></View>
            <View style={s.txt}>
              <Text variant="h4" tone="white">{t("shm.rp.title")}</Text>
              <Text variant="caption" style={s.sub}>{t("shm.rp.commissionNow", { pct: now })}</Text>
            </View>
            <Icon name="chevron-right" size={20} tone="white" />
          </View>
          <View style={s.dots}>
            {Array.from({ length: goal }, (_, k) => <View key={k} style={[s.dot, { backgroundColor: k < r.joined ? "#FFFFFF" : "rgba(255,255,255,0.28)" }]}>{k < r.joined ? <Icon name="check" size={11} color={brand.b600} /> : null}</View>)}
          </View>
          <Text variant="small" style={s.line}>{left > 0 ? t("shm.rp.progress", { joined: r.joined, invited: r.invited, remaining: left, reward }) : t("shm.rp.done", { reward })}</Text>
        </LinearGradient>
      </PressableScale>
    </Fade>
  );
}

const s = StyleSheet.create({
  card: { gap: 12, padding: 16, borderRadius: radius.rl, overflow: "hidden" },
  ring: { position: "absolute", width: 150, height: 150, borderRadius: 75, borderWidth: 18, borderColor: "rgba(255,255,255,0.12)", right: -40, bottom: -50 },
  head: { flexDirection: "row", alignItems: "center", gap: 12 },
  ico: { width: 40, height: 40, borderRadius: 13, backgroundColor: "rgba(255,255,255,0.22)", alignItems: "center", justifyContent: "center" },
  txt: { flex: 1, gap: 1 },
  sub: { color: "rgba(255,255,255,0.85)" },
  dots: { flexDirection: "row", gap: 8 },
  dot: { flex: 1, maxWidth: 34, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  line: { color: "rgba(255,255,255,0.92)" },
});
