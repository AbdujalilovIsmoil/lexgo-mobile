import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Icon, PressableScale, Text } from "@/shared/ui";
import { gradient, radius, shadows, useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { fmtMoney } from "@/shared/lib/money";
import type { Lawyer } from "../model/types";
import type { AiMatch } from "../model/marketTypes";
import { useGeoLabels } from "../lib/labels";
import { AiMatchStrip } from "./AiMatchStrip";
import { MarketKpis } from "./MarketKpis";
import { Monogram } from "./Monogram";

// The web directory's seller card (.mk-card), top to bottom: a 3 pt brand line, rating-ring monogram, name with the
// verified shield, type chip + place, the AI match (when there is one), the three counters, up to two services, and a
// dashed footer with the "from" price and "Batafsil".
export function MarketCard({ lawyer: l, onPress, match }: { lawyer: Lawyer; onPress: () => void; match?: AiMatch }) {
  const c = useColors();
  const { t } = useT();
  const geo = useGeoLabels();
  const titles = (l.services.length ? l.services.map((x) => x.title) : []).filter(Boolean);
  const place = [l.region ? geo.region(l.region) : "", l.district && l.district.toLowerCase() !== "demo" ? l.district : ""].filter(Boolean).join(", ");
  const kind = t(l.kind === "advocate" ? "mkw.roles.advokat" : "mkw.roles.yurist");
  const violet = l.kind !== "advocate";
  return (
    <PressableScale onPress={onPress} accessibilityRole="button" accessibilityLabel={l.name} style={[s.card, { backgroundColor: c.surface, borderColor: l.promoted ? "#F4B63F" : c.line }, shadows.s1]}>
      <LinearGradient colors={l.promoted ? ["#F4B63F", "#FFD27A"] : [...gradient.primary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.line} />
      {l.promoted ? <View style={s.ad}><Text variant="caption" weight="bold" style={s.adT}>{t("mkw.card.promoted")}</Text></View> : null}
      <View style={s.head}>
        <Monogram name={l.name} rating={l.rating} ring={l.rated} />
        <View style={s.who}>
          <View style={s.nameRow}>
            <Text variant="h4" numberOfLines={2} style={s.name}>{l.name}</Text>
            {l.verified ? <Icon name="shield" size={17} color={c.accent} /> : null}
          </View>
          <View style={s.meta}>
            <View style={[s.type, { backgroundColor: violet ? "rgba(124,58,237,0.16)" : c.tint2 }]}><Text variant="caption" weight="bold" style={{ color: violet ? "#8B5CF6" : c.accentStrong }}>{kind}</Text></View>
            {place ? <View style={s.place}><Icon name="map-pin" size={13} color={c.gray} /><Text variant="caption" tone="gray" numberOfLines={1}>{place}</Text></View> : null}
          </View>
        </View>
      </View>
      {match ? <AiMatchStrip match={match} /> : null}
      <MarketKpis lawyer={l} />
      {titles.length ? (
        <View style={[s.svc, { borderBottomColor: c.line }]}>
          <Text variant="small" numberOfLines={1} style={s.svcT}>{titles[0]}</Text>
          {titles.length > 1 ? <><Text variant="small" tone="gray">·</Text><Text variant="small" weight="bold" style={{ color: c.accent }}>{t("mkw.card.servicesMore", { n: titles.length - 1 })}</Text></> : null}
        </View>
      ) : null}
      <View style={s.foot}>
        <View style={s.flex}>
          <Text variant="body" weight="bold" numberOfLines={1}>{l.basePrice > 0 ? t("mkw.card.priceFrom", { price: fmtMoney(l.basePrice) }) : t("mkw.card.priceAsk")}</Text>
          {!l.available ? <Text variant="caption" tone="warn">{t("mkw.card.busy")}</Text> : null}
        </View>
        <View style={[s.go, { backgroundColor: c.tint2 }]}><Text variant="small" weight="bold" style={{ color: c.accentStrong }}>{t("mkw.card.details")}</Text><Icon name="arrow-right" size={15} color={c.accentStrong} /></View>
      </View>
    </PressableScale>
  );
}

const s = StyleSheet.create({
  card: { gap: 14, padding: 18, borderRadius: 22, borderWidth: 1, overflow: "hidden" },
  line: { position: "absolute", top: 0, left: 0, right: 0, height: 3 },
  ad: { position: "absolute", top: 12, right: 12, paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill, backgroundColor: "#F4B63F" },
  adT: { color: "#3A2500", fontSize: 11, textTransform: "uppercase" },
  head: { flexDirection: "row", alignItems: "center", gap: 14 },
  who: { flex: 1, gap: 6 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  name: { flexShrink: 1 },
  meta: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8 },
  type: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: radius.pill },
  place: { flexDirection: "row", alignItems: "center", gap: 4, flexShrink: 1 },
  svc: { flexDirection: "row", alignItems: "center", gap: 8, paddingBottom: 14, borderBottomWidth: 1, borderStyle: "dashed" },
  svcT: { flexShrink: 1 },
  foot: { flexDirection: "row", alignItems: "center", gap: 10 },
  go: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 16, height: 40, borderRadius: radius.pill },
  flex: { flex: 1 },
});
