import { Fragment } from "react";
import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { radius, shadows } from "@/shared/theme";
import { Avatar, PressableScale, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";

export type CardStat = { key: string; value: string; label: string; to: string };

// The professional at a glance, right under the urgent alert: the photo (or monogram) in a ring, role · plan, the name, the motto, and the four
// numbers that matter today — active cases, open requests, deadlines today, rating — on a frosted strip; each opens its list.
export function ProfileCard({ name, avatar, kicker, stats }: { name: string; avatar?: string; kicker: string; stats: CardStat[] }) {
  const { t } = useT();
  const router = useRouter();
  return (
    <LinearGradient colors={["#0E2457", "#173A86", "#2456C2"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[s.card, shadows.blue]}>
      <View style={s.glow} pointerEvents="none" />
      <PressableScale onPress={() => router.push("/pro/profile" as never)} scale={0.99} accessibilityRole="button" accessibilityLabel={`${name}, ${kicker}`} style={s.head}>
        <View style={s.ring}><Avatar name={name} uri={avatar || undefined} size={60} /></View>
        <View style={s.who}>
          <Text variant="caption" weight="bold" numberOfLines={1} style={s.kick}>{kicker.toUpperCase()}</Text>
          <Text variant="h2" tone="white" numberOfLines={1} adjustsFontSizeToFit>{name}</Text>
          <Text variant="small" numberOfLines={1} style={s.motto}>{t("shm.dash.heroTitle")}</Text>
        </View>
      </PressableScale>
      <View style={s.strip}>
        {stats.map((x, i) => (
          <Fragment key={x.key}>
            {i ? <View style={s.rule} /> : null}
            <PressableScale onPress={() => router.push(x.to as never)} scale={0.96} accessibilityRole="button" accessibilityLabel={`${x.label}: ${x.value}`} style={s.stat}>
              <Text variant="h3" tone="white" numberOfLines={1} adjustsFontSizeToFit>{x.value}</Text>
              <Text variant="caption" weight="semibold" numberOfLines={2} maxFontSizeMultiplier={1.1} style={s.lbl}>{x.label}</Text>
            </PressableScale>
          </Fragment>
        ))}
      </View>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  card: { borderRadius: radius.rl, padding: 18, gap: 16, overflow: "hidden" },
  glow: { position: "absolute", width: 220, height: 220, borderRadius: 110, backgroundColor: "rgba(0,207,232,0.12)", right: -70, top: -90 },
  head: { flexDirection: "row", alignItems: "center", gap: 14 },
  ring: { padding: 3, borderRadius: 36, borderWidth: 2, borderColor: "rgba(255,255,255,0.35)" },
  who: { flex: 1, minWidth: 0, gap: 2 },
  kick: { color: "#C9D8F5", letterSpacing: 0.8 },
  motto: { color: "#C4D6F5" },
  strip: { flexDirection: "row", alignItems: "stretch", borderRadius: 16, backgroundColor: "rgba(255,255,255,0.12)", borderWidth: 1, borderColor: "rgba(255,255,255,0.14)", paddingVertical: 12 },
  rule: { width: StyleSheet.hairlineWidth, backgroundColor: "rgba(255,255,255,0.28)" },
  stat: { flex: 1, paddingHorizontal: 10, gap: 2 },
  lbl: { color: "rgba(255,255,255,0.82)", fontSize: 11, lineHeight: 14 },
});
