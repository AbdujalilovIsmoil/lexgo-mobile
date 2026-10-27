import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { fmtRating } from "@/shared/lib/format";
import { brand, radius, shadows } from "@/shared/theme";
import { Icon, PressableScale, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { useGeoLabels } from "../lib/labels";
import type { MyMatch } from "../model/marketTypes";
import { Monogram } from "./Monogram";

const SKY = [brand.b800, brand.b600, "#0E9FD0"] as const;

// The single best pick as a hero: gradient card with the monogram, name, area · region, rating ("not rated yet" until the backend
// rates him), a match bar with the big percentage, the AI reason and a white "open profile" button. `footer` sits under the button.
export function BestMatchCard({ match: m, onPress, footer }: { match: MyMatch; onPress: () => void; footer?: ReactNode }) {
  const { t, locale } = useT();
  const geo = useGeoLabels();
  const pct = Math.min(m.pct, 100);
  const facts = [m.area.split(",")[0]?.trim() ? geo.area(m.area.split(",")[0].trim()) : "", m.region ? geo.region(m.region) : ""].filter(Boolean).join(" · ");
  return (
    <LinearGradient colors={[...SKY]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[s.card, shadows.blue]}>
      <View style={s.top}>
        <View style={s.tag}><Icon name="award" size={13} color="#FFFFFF" /><Text variant="caption" weight="bold" tone="white">{t("mpx.best")}</Text></View>
        <Text variant="h2" tone="white">{pct}%</Text>
      </View>
      <View style={s.bar}><View style={[s.fill, { width: `${pct}%` }]} /></View>
      <View style={s.who}>
        <Monogram name={m.name || "A"} rating={m.rating} size={58} ring={m.rated} />
        <View style={s.col}>
          <Text variant="h4" tone="white" numberOfLines={1}>{m.name || "—"}</Text>
          {facts ? <Text variant="small" tone="white" numberOfLines={1} style={s.soft}>{facts}</Text> : null}
          {m.rated ? (
            <View style={s.rate}><Icon name="star" size={13} color="#FFD36B" /><Text variant="caption" tone="white" weight="bold">{fmtRating(m.rating, locale)}</Text></View>
          ) : <Text variant="caption" tone="white" weight="bold" style={s.soft}>{t("lawyers.card.unrated")}</Text>}
        </View>
      </View>
      {m.reason ? <Text variant="small" tone="white" numberOfLines={3} style={s.soft}>{m.reason}</Text> : null}
      <PressableScale onPress={onPress} accessibilityRole="button" style={s.cta}>
        <Text variant="body" weight="bold" style={s.ctaTx}>{t("mpx.open")}</Text>
        <Icon name="arrow-right" size={17} color={brand.b900} />
      </PressableScale>
      {footer}
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  card: { padding: 18, borderRadius: radius.rl, gap: 14, overflow: "hidden" },
  top: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  tag: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.2)" },
  bar: { height: 6, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.25)", overflow: "hidden" },
  fill: { height: 6, borderRadius: 3, backgroundColor: "#FFFFFF" },
  who: { flexDirection: "row", alignItems: "center", gap: 14 },
  col: { flex: 1, gap: 3 },
  rate: { flexDirection: "row", alignItems: "center", gap: 5 },
  soft: { opacity: 0.85 },
  cta: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 48, borderRadius: 14, backgroundColor: "#FFFFFF" },
  ctaTx: { color: brand.b900 },
});
