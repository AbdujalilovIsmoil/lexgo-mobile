import { useState } from "react";
import { Image, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Icon, PressableScale, Text } from "@/shared/ui";
import { brand, radius } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { fmtRating, humanizeSlug } from "@/shared/lib/format";
import { daysLeft, Monogram, useGeoLabels, type PromoSurface } from "@/entities/lawyer";

const MIN_H = 220; // both kinds of card are at least this tall; the rail stretches them to the tallest one
const DEFAULT_CTA = /^profilni ko['‘’ʻ`]?rish$/i; // the backend's own Uzbek label: shown in the app's language instead

// One top banner as on the web. `banner_mode` "image" (or an older answer with a picture) draws the seller's picture with the
// headline and the button over a dark fade; "profile_card", no picture or a picture that does not load (an expired asset answers
// 404) draws the dark brand card: who, "type · area · place", rating and years, and the monogram. A tap opens the specialist.
export function PromoCard({ item, onPress }: { item: PromoSurface; onPress: () => void }) {
  const { t } = useT();
  const geo = useGeoLabels();
  const [failed, setFailed] = useState("");
  const photo = item.bannerMode !== "profile_card" && item.imageUrl !== failed ? item.imageUrl : "";
  const parts = item.subtitle.split(/[•·]/).map((x) => x.trim()).filter(Boolean);
  const kind = item.sellerKind ? t(item.sellerKind.includes("advokat") ? "mkw.roles.advokat" : "mkw.roles.yurist") : parts[0] ?? "";
  const spec = parts.length > 2 ? geo.area(parts[1]) || humanizeSlug(parts[1]) : "";
  const region = item.sellerRegion ? geo.region(item.sellerRegion) : parts.length > 1 ? geo.region(parts[parts.length - 1]) : "";
  // The seller's own banner line; the backend fills `subtitle` with his headline ("Advokat • area • region") when he wrote none.
  const own = item.sellerHeadline.trim() && item.subtitle.trim() !== item.sellerHeadline.trim() ? item.subtitle.trim() : "";
  const sub = item.serviceTitle ? item.sellerName : own || [kind, spec, region].filter(Boolean).join(" · ");
  const label = item.ctaLabel.trim();
  const cta = label && !DEFAULT_CTA.test(label) ? label : (label || item.sellerUserId) ? t("mk1.view") : "";
  const title = item.serviceTitle || item.title || item.sellerName || t("prm.bannerTitle");
  return (
    <PressableScale onPress={onPress} accessibilityRole="button" style={s.wrap}>
      {photo ? (
        <View style={[s.card, s.photoCard]}>
          <CoverPhoto key={photo} uri={photo} onFail={() => setFailed(photo)} />
          <LinearGradient colors={["rgba(7,29,67,0.92)", "rgba(7,29,67,0.6)", "rgba(7,29,67,0.15)"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} pointerEvents="none" />
          <Top endsAt={item.endsAt} />
          <View style={s.copy}>
            <Text variant="h3" tone="white" numberOfLines={2}>{title}</Text>
            {sub ? <Text variant="small" style={s.sub} numberOfLines={2}>{sub}</Text> : null}
          </View>
          {cta ? <Cta label={cta} /> : null}
        </View>
      ) : (
        <LinearGradient colors={["#0B1F45", "#123A86", "#0E5FC4"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.card}>
          <View style={s.glow} pointerEvents="none" />
          <Top endsAt={item.endsAt} />
          <View style={s.row}>
            <View style={s.flex}>
              <Text variant="h3" tone="white" numberOfLines={2}>{title}</Text>
              <Text variant="small" style={s.sub} numberOfLines={2}>{sub}</Text>
            </View>
            <Monogram name={item.sellerName || item.title} rating={item.sellerRating} size={64} ring={item.sellerRated} />
          </View>
          <Facts item={item} />
          {cta ? <Cta label={cta} /> : null}
        </LinearGradient>
      )}
    </PressableScale>
  );
}

// The megaphone eyebrow and the days that are left.
function Top({ endsAt }: { endsAt: string }) {
  const { t } = useT();
  const left = daysLeft(endsAt);
  return (
    <View style={s.top}>
      <View style={s.eyebrow}><Icon name="volume-2" size={14} color={brand.cy} /><Text variant="caption" weight="bold" style={s.eyeT}>{t("mkw.promo.top")}</Text></View>
      {left >= 0 ? <View style={s.left}><Icon name="clock" size={13} color="#CFE2FF" /><Text variant="caption" weight="bold" tone="white">{t("mkw.promo.left", { n: left })}</Text></View> : null}
    </View>
  );
}

// Rating (or "not rated yet" — never a made-up 5.0) and years of experience.
function Facts({ item }: { item: PromoSurface }) {
  const { t, locale } = useT();
  return (
    <View style={s.facts}>
      {item.sellerRated ? (
        <View style={s.fact}><Icon name="star" size={14} color="#F4B63F" /><Text variant="small" weight="bold" tone="white">{fmtRating(item.sellerRating, locale)}</Text>{item.sellerReviews ? <Text variant="caption" style={s.sub}>{t("mkw.card.reviews", { count: item.sellerReviews })}</Text> : null}</View>
      ) : item.sellerUserId ? <Text variant="caption" weight="bold" style={s.sub}>{t("mkw.card.newSeller")}</Text> : null}
      {item.sellerYears ? <View style={s.fact}><Text variant="small" weight="bold" tone="white">{item.sellerYears}</Text><Text variant="caption" style={s.sub}>{t("mkw.card.experience")}</Text></View> : null}
    </View>
  );
}

function Cta({ label }: { label: string }) {
  return <View style={s.cta}><Text variant="small" weight="bold" style={s.ctaT} numberOfLines={1}>{label}</Text><Icon name="arrow-right" size={15} color="#0B1F45" /></View>;
}

// The picture covers the card from its top edge: a portrait keeps the head and shoulders (uploaded banners are portraits the backend
// checks for a face), a wide picture fills the card. It stays invisible until loaded; a failed load hands the card back (`onFail`).
function CoverPhoto({ uri, onFail }: { uri: string; onFail: () => void }) {
  const [box, setBox] = useState({ w: 0, h: 0 });
  const [ratio, setRatio] = useState(0); // width / height of the loaded picture
  const tall = ratio > 0 && box.h > 0 && ratio < box.w / box.h;
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none" onLayout={(e) => setBox({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}>
      <Image
        source={{ uri }}
        resizeMode="cover"
        onLoad={(e) => { const { width, height } = e.nativeEvent.source; setRatio(width > 0 && height > 0 ? width / height : 1); }}
        onError={onFail}
        style={[tall ? { position: "absolute", top: 0, left: 0, width: box.w, height: box.w / ratio } : StyleSheet.absoluteFill, { opacity: ratio ? 1 : 0 }]}
        accessibilityIgnoresInvertColors
      />
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { width: "100%", flex: 1 },
  card: { flex: 1, minHeight: MIN_H, borderRadius: radius.rx, padding: 18, gap: 12, overflow: "hidden" },
  photoCard: { backgroundColor: "#0B1F45", justifyContent: "space-between" },
  glow: { position: "absolute", top: -80, right: -50, width: 220, height: 220, borderRadius: 110, backgroundColor: "rgba(0,207,232,0.16)" },
  top: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  eyebrow: { flexDirection: "row", alignItems: "center", gap: 6 },
  eyeT: { color: brand.cy, letterSpacing: 2, textTransform: "uppercase" },
  left: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, height: 30, borderRadius: 15, backgroundColor: "rgba(255,255,255,0.14)" },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  flex: { flex: 1, gap: 4 },
  copy: { gap: 4, maxWidth: "76%" },
  sub: { color: "rgba(255,255,255,0.78)" },
  facts: { flexDirection: "row", alignItems: "center", gap: 18 },
  fact: { flexDirection: "row", alignItems: "center", gap: 5 },
  cta: { flexDirection: "row", alignItems: "center", gap: 8, alignSelf: "flex-start", maxWidth: "100%", height: 44, paddingHorizontal: 18, borderRadius: 22, backgroundColor: "#FFFFFF" },
  ctaT: { color: "#0B1F45", flexShrink: 1 },
});
