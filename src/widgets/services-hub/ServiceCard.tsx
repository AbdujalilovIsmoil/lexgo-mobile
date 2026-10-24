import { Image, StyleSheet, View, type ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";
import { serviceTone, subcatImage, usePriceLabel, type Service } from "@/entities/service";
import { radius, useColors } from "@/shared/theme";
import { Icon, PressableScale, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import type { Grid } from "@/shared/lib/useGrid";

// A service as a tall card for a two-column grid: a coloured art area (the direction's picture or an icon, kind badge and the
// "advocate" shield on it), the name, the direction, and the price at the bottom. Cards rise in one after another.
export function ServiceCard({ service: sv, index, cell, move, onPress }: { service: Service; index: number; cell?: ViewStyle; move?: Grid["move"]; onPress: () => void }) {
  const c = useColors();
  const { t } = useT();
  const price = usePriceLabel();
  const doc = !!sv.documentTemplateId;
  const art = subcatImage(sv.subcategory ?? "");
  return (
    <Animated.View entering={FadeInDown.delay(Math.min(index, 8) * 45).duration(300)} layout={move} style={[s.cell, cell]}>
      <PressableScale onPress={onPress} scale={0.97} accessibilityRole="button" accessibilityLabel={`${sv.name}. ${price(sv)}`} style={[s.card, { backgroundColor: c.glassFill, borderColor: c.glassLine }]}>
        <LinearGradient colors={[...serviceTone(sv.categoryId ?? sv.id)]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.art}>
          <View style={s.ring} pointerEvents="none" />
          {art ? <Image source={art} style={s.img} resizeMode="contain" /> : <Icon name={doc ? "file-text" : "briefcase"} size={38} tone="white" />}
          <View style={s.badge}><Icon name={doc ? "file-text" : "briefcase"} size={12} tone="white" /><Text variant="caption" weight="bold" tone="white">{t(doc ? "svh.doc" : "svh.service")}</Text></View>
          {sv.advokatRequired ? <View style={s.shield}><Icon name="shield" size={13} tone="white" /></View> : null}
        </LinearGradient>
        <View style={s.body}>
          <Text variant="small" weight="bold" numberOfLines={3} style={s.name}>{sv.name}</Text>
          {sv.categoryTitle ? <Text variant="caption" tone="gray" numberOfLines={1}>{sv.categoryTitle}</Text> : null}
          <View style={s.foot}>
            <Text variant="small" weight="bold" tone="accent" numberOfLines={1} style={s.price}>{price(sv)}</Text>
            <View style={[s.go, { backgroundColor: c.tint2 }]}><Icon name="arrow-right" size={14} color={c.accent} /></View>
          </View>
        </View>
      </PressableScale>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  cell: { width: "48.5%" },
  card: { borderRadius: radius.rl, borderWidth: 1, overflow: "hidden" },
  art: { height: 104, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  ring: { position: "absolute", width: 110, height: 110, borderRadius: 55, borderWidth: 14, borderColor: "rgba(255,255,255,0.14)", right: -34, top: -34 },
  img: { width: 78, height: 78 },
  badge: { position: "absolute", left: 8, top: 8, flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, backgroundColor: "rgba(0,0,0,0.28)" },
  shield: { position: "absolute", right: 8, top: 8, width: 24, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.28)" },
  body: { padding: 12, gap: 4 },
  name: { minHeight: 54 },
  foot: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 6 },
  price: { flex: 1 },
  go: { width: 26, height: 26, borderRadius: 13, alignItems: "center", justifyContent: "center" },
});
