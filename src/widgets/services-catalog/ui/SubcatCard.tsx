import { Image, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { subcatIcon, subcatImage } from "@/entities/service";
import { radius, useColors } from "@/shared/theme";
import { Icon, PressableScale, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import type { ImageSourcePropType } from "react-native";

type Props = { name: string; count: number; index: number; family?: string; samples: string[]; art?: ImageSourcePropType | null; onPress: () => void };

// One direction as a tile: the web's illustration on a tinted stage (an icon when there is none), the name, the area it
// belongs to, how many services, and a couple of example titles.
export function SubcatCard({ name, count, index, family, samples = [], art, onPress }: Props) {
  const c = useColors();
  const { t } = useT();
  const img = art === undefined ? subcatImage(name) : art;
  return (
    <PressableScale onPress={onPress} scale={0.97} accessibilityRole="button" style={[s.card, { backgroundColor: c.glassFill, borderColor: c.glassLine }]}>
      <LinearGradient colors={[c.tint, c.tint2]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.stage}>
        {img ? <Image source={img} style={s.art} resizeMode="contain" /> : <Icon name={subcatIcon(name, index)} size={44} color={c.accent} />}
        <View style={[s.go, { backgroundColor: c.surface }]}><Icon name="arrow-up-right" size={14} color={c.accent} /></View>
      </LinearGradient>
      <View style={s.col}>
        <Text variant="small" weight="bold" numberOfLines={3}>{name}</Text>
        {family ? <Text variant="caption" weight="semibold" tone="accent" numberOfLines={1}>{family}</Text> : null}
        <View style={[s.count, { backgroundColor: c.tint2 }]}><Text variant="caption" weight="bold" tone="accent">{t("csv.servicesN", { n: count })}</Text></View>
        {samples.length ? <Text variant="caption" style={{ color: c.gray2 }} numberOfLines={2}>{t("csv.samples", { list: samples.join(" · ") })}</Text> : null}
      </View>
    </PressableScale>
  );
}

const s = StyleSheet.create({
  card: { flex: 1, borderRadius: radius.rl, borderWidth: 1.5, overflow: "hidden" },
  stage: { height: 118, alignItems: "center", justifyContent: "center" },
  art: { width: "78%", height: "88%" },
  go: { position: "absolute", right: 8, top: 8, width: 26, height: 26, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  col: { gap: 5, padding: 12, alignItems: "flex-start" },
  count: { borderRadius: 999, paddingHorizontal: 9, paddingVertical: 3 },
});
