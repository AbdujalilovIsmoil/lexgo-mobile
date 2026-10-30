import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Avatar, Icon, PressableScale, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { daysLeft, useGeoLabels, type PromoSurface } from "@/entities/lawyer";

// A paid banner as one compact row (the directory): the TOP mark with the days left, the headline (the advertised service, else the
// seller), who and where, the rating and years, and the monogram. A tap opens the specialist.
export function PromoRow({ item, onPress }: { item: PromoSurface; onPress: () => void }) {
  const { t } = useT();
  const geo = useGeoLabels();
  const left = daysLeft(item.endsAt);
  const kind = item.sellerKind ? t(item.sellerKind.includes("advokat") ? "mkw.roles.advokat" : "mkw.roles.yurist") : "";
  const who = [item.serviceTitle ? item.sellerName : kind, item.sellerRegion ? geo.region(item.sellerRegion) : ""].filter(Boolean).join(" · ");
  const facts = [item.sellerRated ? `★ ${item.sellerRating.toFixed(1)}${item.sellerReviews ? ` (${item.sellerReviews})` : ""}` : "", item.sellerYears ? t("mk1.dir.years", { n: item.sellerYears }) : ""].filter(Boolean).join(" · ");
  const title = item.serviceTitle || item.sellerName || item.title || t("prm.bannerTitle");
  return (
    <PressableScale onPress={onPress} scale={0.98} accessibilityRole="button" accessibilityLabel={title}>
      <LinearGradient colors={["#0B1F45", "#123A86", "#0E5FC4"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.card}>
        <Avatar name={item.sellerName || title} size={46} />
        <View style={s.mid}>
          <View style={s.tags}>
            <View style={s.top}><Icon name="volume-2" size={11} color="#5FD9FF" /><Text variant="caption" weight="bold" style={s.topTx}>{t("mkw.promo.top")}</Text></View>
            {left >= 0 ? <Text variant="caption" style={s.dim}>{t("mkw.promo.left", { n: left })}</Text> : null}
          </View>
          <Text variant="h4" tone="white" numberOfLines={1}>{title}</Text>
          <Text variant="caption" numberOfLines={1} style={s.dim}>{[who, facts].filter(Boolean).join(" · ")}</Text>
        </View>
        <Icon name="chevron-right" size={18} color="#CFE2FF" />
      </LinearGradient>
    </PressableScale>
  );
}

const s = StyleSheet.create({
  card: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 14, paddingVertical: 12, borderRadius: 20 },
  mid: { flex: 1, minWidth: 0, gap: 2 },
  tags: { flexDirection: "row", alignItems: "center", gap: 8 },
  top: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(95,217,255,0.14)", borderRadius: 6, paddingHorizontal: 6, paddingVertical: 1 },
  topTx: { color: "#5FD9FF", fontSize: 10, letterSpacing: 0.6 },
  dim: { color: "rgba(255,255,255,0.75)" },
});
