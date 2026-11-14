import { Fragment } from "react";
import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Scale, type LucideIcon } from "lucide-react-native";
import { radius, shadows } from "@/shared/theme";
import { Avatar, PressableScale, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";

export type HeroStat = { key: string; icon: LucideIcon; value: string; label: string; to: string };

// The professional at a glance: a deep blue glass card with a light rim — the photo (or monogram) in a glowing ring, role · plan, the name and
// the motto, the scales of justice drawn faintly on the right; under a hairline the four numbers of the day, each with its icon, each opening
// its list.
export function HeroCard({ name, avatar, kicker, stats }: { name: string; avatar?: string; kicker: string; stats: HeroStat[] }) {
  const { t } = useT();
  const router = useRouter();
  return (
    <LinearGradient colors={["#0B2A6B", "#123C93", "#1E5BD8"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[s.card, shadows.blue]}>
      <View style={s.glow} pointerEvents="none" />
      <View style={s.art} pointerEvents="none"><Scale size={118} color="rgba(255,255,255,0.22)" strokeWidth={1.2} /></View>
      <PressableScale onPress={() => router.push("/pro/profile" as never)} scale={0.99} accessibilityRole="button" accessibilityLabel={`${name}, ${kicker}`} style={s.head}>
        <View style={s.ring}><Avatar name={name} uri={avatar || undefined} size={62} /></View>
        <View style={s.who}>
          <Text variant="caption" weight="bold" numberOfLines={1} style={s.kick}>{kicker.toUpperCase()}</Text>
          <Text variant="h2" tone="white" numberOfLines={1} adjustsFontSizeToFit>{name}</Text>
          <Text variant="small" numberOfLines={1} style={s.motto}>{t("shm.dash.heroTitle")}</Text>
        </View>
      </PressableScale>
      <View style={s.rule} />
      <View style={s.strip}>
        {stats.map(({ key, icon: Glyph, value, label, to }, i) => (
          <Fragment key={key}>
            {i ? <View style={s.sep} /> : null}
            <PressableScale onPress={() => router.push(to as never)} scale={0.96} accessibilityRole="button" accessibilityLabel={`${label}: ${value}`} style={s.stat}>
              <Glyph size={20} color="#FFFFFF" strokeWidth={2} />
              <Text variant="h3" tone="white" numberOfLines={1} adjustsFontSizeToFit style={s.value}>{value}</Text>
              <Text variant="caption" weight="semibold" numberOfLines={2} maxFontSizeMultiplier={1.1} style={s.lbl}>{label}</Text>
            </PressableScale>
          </Fragment>
        ))}
      </View>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  card: { borderRadius: radius.rl, borderWidth: 1.5, borderColor: "rgba(120,170,255,0.55)", overflow: "hidden" },
  glow: { position: "absolute", width: 260, height: 260, borderRadius: 130, backgroundColor: "rgba(56,140,255,0.28)", right: -80, top: -110 },
  art: { position: "absolute", right: 10, top: 6 },
  head: { flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 18, paddingTop: 18, paddingBottom: 16, paddingRight: 110 },
  ring: { padding: 3, borderRadius: 38, borderWidth: 2, borderColor: "rgba(140,190,255,0.55)", backgroundColor: "rgba(255,255,255,0.06)" },
  who: { flex: 1, minWidth: 0, gap: 2 },
  kick: { color: "#C9D8F5", letterSpacing: 0.8 },
  motto: { color: "#C4D6F5" },
  rule: { height: StyleSheet.hairlineWidth, backgroundColor: "rgba(255,255,255,0.28)" },
  strip: { flexDirection: "row", alignItems: "stretch", paddingVertical: 14, paddingHorizontal: 6 },
  sep: { width: StyleSheet.hairlineWidth, backgroundColor: "rgba(255,255,255,0.28)", marginVertical: 6 },
  stat: { flex: 1, paddingHorizontal: 10, gap: 4 },
  value: { marginTop: 2 },
  lbl: { color: "rgba(255,255,255,0.85)", fontSize: 12, lineHeight: 15 },
});
