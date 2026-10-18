import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Icon, PressableScale, Text } from "@/shared/ui";
import { brand, radius } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { fmtRating, humanizeSlug } from "@/shared/lib/format";
import { daysLeft, Monogram, useGeoLabels, type PromoSurface } from "@/entities/lawyer";

// One paid placement as on the web ("Top"): a dark brand card with the megaphone eyebrow, the days that are left, who, "type ·
// area · place", rating and years, and a white "Profilni ko'rish" button. A tap opens the specialist.
export function PromoCard({ item, onPress }: { item: PromoSurface; onPress: () => void }) {
  const { t, locale } = useT();
  const geo = useGeoLabels();
  const parts = item.subtitle.split(/[•·]/).map((x) => x.trim()).filter(Boolean);
  const kind = item.sellerKind ? t(item.sellerKind.includes("advokat") ? "mkw.roles.advokat" : "mkw.roles.yurist") : parts[0] ?? "";
  const spec = parts.length > 2 ? geo.area(parts[1]) || humanizeSlug(parts[1]) : "";
  const region = item.sellerRegion ? geo.region(item.sellerRegion) : parts.length > 1 ? geo.region(parts[parts.length - 1]) : "";
  const sub = item.serviceTitle ? item.sellerName : [kind, spec, region].filter(Boolean).join(" · ");
  const left = daysLeft(item.endsAt);
  return (
    <PressableScale onPress={onPress} accessibilityRole="button" style={s.wrap}>
      <LinearGradient colors={["#0B1F45", "#123A86", "#0E5FC4"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.card}>
        <View style={s.glow} pointerEvents="none" />
        <View style={s.top}>
          <View style={s.eyebrow}><Icon name="volume-2" size={14} color={brand.cy} /><Text variant="caption" weight="bold" style={s.eyeT}>{t("mkw.promo.top")}</Text></View>
          {left >= 0 ? <View style={s.left}><Icon name="clock" size={13} color="#CFE2FF" /><Text variant="caption" weight="bold" tone="white">{t("mkw.promo.left", { n: left })}</Text></View> : null}
        </View>
        <View style={s.row}>
          <View style={s.flex}>
            <Text variant="h3" tone="white" numberOfLines={2}>{item.serviceTitle || item.title || item.sellerName}</Text>
            <Text variant="small" style={s.sub} numberOfLines={2}>{sub}</Text>
          </View>
          <Monogram name={item.sellerName || item.title} rating={item.sellerRating} size={64} ring={item.sellerRating > 0} />
        </View>
        <View style={s.facts}>
          {item.sellerRating > 0 ? <View style={s.fact}><Icon name="star" size={14} color="#F4B63F" /><Text variant="small" weight="bold" tone="white">{fmtRating(item.sellerRating, locale)}</Text>{item.sellerReviews ? <Text variant="caption" style={s.sub}>{t("mkw.card.reviews", { count: item.sellerReviews })}</Text> : null}</View> : null}
          {item.sellerYears ? <View style={s.fact}><Text variant="small" weight="bold" tone="white">{item.sellerYears}</Text><Text variant="caption" style={s.sub}>{t("mkw.card.experience")}</Text></View> : null}
        </View>
        <View style={s.cta}><Text variant="small" weight="bold" style={s.ctaT}>{item.ctaLabel || t("mk1.view")}</Text><Icon name="arrow-right" size={15} color="#0B1F45" /></View>
      </LinearGradient>
    </PressableScale>
  );
}

const s = StyleSheet.create({
  wrap: { width: "100%" },
  card: { borderRadius: radius.rx, padding: 18, gap: 12, overflow: "hidden" },
  glow: { position: "absolute", top: -80, right: -50, width: 220, height: 220, borderRadius: 110, backgroundColor: "rgba(0,207,232,0.16)" },
  top: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  eyebrow: { flexDirection: "row", alignItems: "center", gap: 6 },
  eyeT: { color: brand.cy, letterSpacing: 2, textTransform: "uppercase" },
  left: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, height: 30, borderRadius: 15, backgroundColor: "rgba(255,255,255,0.14)" },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  flex: { flex: 1, gap: 4 },
  sub: { color: "rgba(255,255,255,0.78)" },
  facts: { flexDirection: "row", alignItems: "center", gap: 18 },
  fact: { flexDirection: "row", alignItems: "center", gap: 5 },
  cta: { flexDirection: "row", alignItems: "center", gap: 8, alignSelf: "flex-start", height: 44, paddingHorizontal: 18, borderRadius: 22, backgroundColor: "#FFFFFF" },
  ctaT: { color: "#0B1F45" },
});
