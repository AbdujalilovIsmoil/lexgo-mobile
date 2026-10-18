import { Image, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeIn, ZoomIn } from "react-native-reanimated";
import { serviceTone, subcatImage, usePriceLabel, type Service } from "@/entities/service";
import { radius, shadows } from "@/shared/theme";
import { Icon, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";

// The top of a service page: a coloured card in its direction's colour with the picture, the kind and "advocate" badges, the
// full name and the price in large type. The picture pops in, the rest fades.
export function ServiceHero({ service: sv }: { service: Service }) {
  const { t } = useT();
  const price = usePriceLabel();
  const doc = !!sv.documentTemplateId;
  const art = subcatImage(sv.subcategory ?? "");
  return (
    <LinearGradient colors={[...serviceTone(sv.categoryId ?? sv.id)]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[s.card, shadows.blue]}>
      <View style={s.ring} pointerEvents="none" />
      <View style={s.top}>
        <View style={s.badges}>
          <View style={s.badge}><Icon name={doc ? "file-text" : "briefcase"} size={13} tone="white" /><Text variant="caption" weight="bold" tone="white">{t(doc ? "svh.doc" : "svh.service")}</Text></View>
          {sv.advokatRequired ? <View style={s.badge}><Icon name="shield" size={13} tone="white" /><Text variant="caption" weight="bold" tone="white">{t("svh.advocate")}</Text></View> : null}
        </View>
        <Animated.View entering={ZoomIn.delay(120).duration(360)} style={s.art}>{art ? <Image source={art} style={s.img} resizeMode="contain" /> : <Icon name={doc ? "file-text" : "briefcase"} size={40} tone="white" />}</Animated.View>
      </View>
      <Animated.View entering={FadeIn.delay(200).duration(320)} style={s.text}>
        {sv.categoryTitle ? <Text variant="small" tone="white" style={s.soft} numberOfLines={1}>{[sv.categoryTitle, sv.subcategory].filter(Boolean).join(" · ")}</Text> : null}
        <Text variant="h2" tone="white">{sv.name}</Text>
        <View style={s.priceRow}><Text variant="caption" tone="white" style={s.soft}>{t("svh.price")}</Text><Text variant="h3" tone="white">{price(sv)}</Text></View>
      </Animated.View>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  card: { padding: 18, borderRadius: radius.rl, gap: 16, overflow: "hidden" },
  ring: { position: "absolute", width: 220, height: 220, borderRadius: 110, borderWidth: 26, borderColor: "rgba(255,255,255,0.12)", right: -70, top: -70 },
  top: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  badges: { gap: 6, alignItems: "flex-start" },
  badge: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, backgroundColor: "rgba(0,0,0,0.26)" },
  art: { width: 88, height: 88, alignItems: "center", justifyContent: "center" },
  img: { width: 88, height: 88 },
  text: { gap: 6 },
  soft: { opacity: 0.85 },
  priceRow: { flexDirection: "row", alignItems: "baseline", gap: 8, marginTop: 4 },
});
