import { Image, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Icon, PressableScale, Text } from "@/shared/ui";
import { gradient, radius, useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import type { DashAction } from "./actionsData";

export const RAIL_CARD = 164;

// One quick action on the hero's rail: icon chip, title (+ subtitle) and the 3D cut-out half off the bottom-right corner.
// The first ("describe") is the bright gradient card; the others are frosted glass on the hero.
export function RailCard({ a, onPress }: { a: DashAction; onPress: () => void }) {
  const { t } = useT();
  const c = useColors();
  const body = (
    <>
      <Image source={a.art} style={s.art} />
      <View style={s.ico}>
        {a.live ? <View style={[s.dot, { backgroundColor: c.ok }]} /> : null}
        <Icon name={a.icon} size={21} color="#FFFFFF" />
      </View>
      <Text variant="body" weight="bold" numberOfLines={3} maxFontSizeMultiplier={1.15} style={s.white}>{t(`cdash.act.${a.key}`)}</Text>
      {a.sub ? <Text variant="caption" numberOfLines={3} maxFontSizeMultiplier={1.15} style={s.sub}>{t(`cdash.act.${a.key}Sub`)}</Text> : null}
    </>
  );
  return (
    <PressableScale onPress={onPress} scale={0.97} style={{ width: RAIL_CARD }} accessibilityRole="button" accessibilityLabel={t(`cdash.act.${a.key}`)}>
      {a.primary ? (
        <LinearGradient colors={gradient.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.card}>{body}</LinearGradient>
      ) : (
        <View style={[s.card, s.glass]}>{body}</View>
      )}
    </PressableScale>
  );
}

const s = StyleSheet.create({
  card: { height: 188, borderRadius: radius.rl, padding: 14, gap: 8, overflow: "hidden" },
  glass: { backgroundColor: "rgba(255,255,255,0.1)", borderWidth: 1, borderColor: "rgba(255,255,255,0.2)" },
  art: { position: "absolute", right: -14, bottom: -14, width: 76, height: 76, opacity: 0.85, resizeMode: "contain" },
  ico: { width: 42, height: 42, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.18)", alignItems: "center", justifyContent: "center" },
  dot: { position: "absolute", top: 5, right: 5, width: 8, height: 8, borderRadius: 4 },
  white: { color: "#FFFFFF" },
  sub: { color: "rgba(255,255,255,0.78)", marginTop: -4 },
});
