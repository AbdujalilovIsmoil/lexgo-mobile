import { Image, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Icon, PressableScale, Text } from "@/shared/ui";
import { brand } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { fmtRating } from "@/shared/lib/format";
import { fmtMoney } from "@/shared/lib/money";
import { useGeoLabels, type Lawyer } from "@/entities/lawyer";

const PHOTO = { advocate: require("../../../assets/market/demo-advokat-card.webp"), lawyer: require("../../../assets/market/demo-yurist-card.webp") };
export const SHOW_W = 224;
const PH = 196; // photo window; the 4:5 picture is aligned to its top so the face and shoulders fill it

// A carousel card (up to ten): the photo on its own, nothing laid over the face — only two small badges in its top
// corners (rating, verified seal) — and a solid panel under it with "TYPE · PLACE", name, area, the "Top" tag when the
// seller is promoted, and a price + arrow row.
export function ShowCard({ l, spec, onPress }: { l: Lawyer; spec: string; onPress: () => void }) {
  const { t, locale } = useT();
  const geo = useGeoLabels();
  const kind = t(l.kind === "advocate" ? "mkw.roles.advokat" : "mkw.roles.yurist");
  return (
    <PressableScale onPress={onPress} accessibilityRole="button" accessibilityLabel={l.name} style={{ width: SHOW_W }}>
      <View style={s.card}>
        <View style={s.photoBox}>
          <Image source={PHOTO[l.kind]} style={[s.photo, { height: (SHOW_W * 5) / 4 }]} />
          <LinearGradient colors={["transparent", "rgba(14,30,66,0.9)"]} style={s.fade} pointerEvents="none" />
          {l.rated ? <View style={[s.badge, s.tl]}><Icon name="star" size={13} color="#F4B63F" /><Text variant="caption" weight="bold" tone="white">{fmtRating(l.rating, locale)}</Text></View> : null}
          {l.verified ? <View style={[s.seal, s.tr]}><Icon name="shield" size={14} color="#7FE3FF" /></View> : null}
        </View>
        <View style={s.body}>
          <Text variant="caption" weight="bold" numberOfLines={1} style={s.eyebrow}>{[kind, l.region ? geo.region(l.region) : ""].filter(Boolean).join(" · ")}</Text>
          <Text variant="h4" tone="white" numberOfLines={1}>{l.name}</Text>
          {spec ? <Text variant="caption" numberOfLines={1} style={s.spec}>{spec}</Text> : null}
          <View style={s.foot}>
            <View style={s.flex}>
              <Text variant="caption" style={s.dim} numberOfLines={1}>{l.experienceYears > 0 ? `${t("mkw.show.years", { n: l.experienceYears })} ${t("mkw.show.expLabel")}` : t("mkw.card.newSeller")}</Text>
              <Text variant="small" weight="bold" tone="white" numberOfLines={1}>{l.basePrice > 0 ? t("mkw.card.priceFrom", { price: fmtMoney(l.basePrice) }) : t("mkw.card.priceAsk")}</Text>
            </View>
            <View style={s.go}><Icon name="arrow-right" size={18} color="#FFFFFF" /></View>
          </View>
        </View>
      </View>
    </PressableScale>
  );
}

const s = StyleSheet.create({
  card: { borderRadius: 24, overflow: "hidden", backgroundColor: "#0E1E42", borderWidth: 1, borderColor: "rgba(92,168,255,0.25)" },
  photoBox: { height: PH, overflow: "hidden", backgroundColor: "#0B1F45" },
  photo: { position: "absolute", top: 0, left: 0, width: "100%", resizeMode: "cover" },
  fade: { position: "absolute", left: 0, right: 0, bottom: 0, height: 36 },
  badge: { position: "absolute", flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, height: 28, borderRadius: 14, backgroundColor: "rgba(3,16,43,0.62)" },
  seal: { position: "absolute", width: 30, height: 30, borderRadius: 15, backgroundColor: "rgba(3,16,43,0.62)", borderWidth: 1, borderColor: "rgba(92,168,255,0.7)", alignItems: "center", justifyContent: "center" },
  tl: { top: 10, left: 10 },
  tr: { top: 10, right: 10 },
  body: { padding: 14, paddingTop: 10, gap: 3 },
  eyebrow: { color: "#7FE3FF", letterSpacing: 1.5, textTransform: "uppercase", fontSize: 10 },
  spec: { color: "rgba(196,222,255,0.8)" },
  foot: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 8 },
  flex: { flex: 1, gap: 1 },
  dim: { color: "rgba(255,255,255,0.65)" },
  go: { width: 40, height: 40, borderRadius: 20, backgroundColor: brand.b600, alignItems: "center", justifyContent: "center" },
});
