import { StyleSheet, View } from "react-native";
import { fmtRating } from "@/shared/lib/format";
import { useColors } from "@/shared/theme";
import { Icon, PressableScale, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { useGeoLabels } from "../lib/labels";
import type { MyMatch } from "../model/marketTypes";
import { Monogram } from "./Monogram";

// One runner-up in the ranking: its place, monogram, name, area · region, the rating ("not rated yet" until the backend rates him),
// and the match percentage over a thin bar.
export function RankedMatchRow({ rank, match: m, onPress }: { rank: number; match: MyMatch; onPress: () => void }) {
  const c = useColors();
  const { t, locale } = useT();
  const geo = useGeoLabels();
  const pct = Math.min(m.pct, 100);
  const first = m.area.split(",")[0]?.trim() ?? "";
  const facts = [first ? geo.area(first) : "", m.region ? geo.region(m.region) : ""].filter(Boolean).join(" · ");
  return (
    <PressableScale onPress={onPress} style={s.row}>
      <Text variant="small" weight="bold" tone="gray" style={s.rank}>{rank}</Text>
      <Monogram name={m.name || "A"} rating={m.rating} size={48} ring={m.rated} />
      <View style={s.body}>
        <Text variant="body" weight="bold" numberOfLines={1}>{m.name || "—"}</Text>
        <Text variant="caption" tone="gray" numberOfLines={1}>{facts}</Text>
        {m.rated ? (
          <View style={s.rate}><Icon name="star" size={12} color={c.warn} /><Text variant="caption" tone="gray">{fmtRating(m.rating, locale)}</Text></View>
        ) : <Text variant="caption" tone="gray">{t("lawyers.card.unrated")}</Text>}
      </View>
      <View style={s.pct}>
        <Text variant="body" weight="bold" tone="accent">{pct}%</Text>
        <View style={[s.track, { backgroundColor: c.line }]}><View style={[s.fill, { width: `${pct}%`, backgroundColor: c.accent }]} /></View>
        <Text variant="caption" tone="gray">{t("mpx.match")}</Text>
      </View>
    </PressableScale>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12 },
  rank: { width: 18, textAlign: "center" },
  body: { flex: 1, gap: 2 },
  rate: { flexDirection: "row", alignItems: "center", gap: 4 },
  pct: { width: 56, alignItems: "flex-end", gap: 3 },
  track: { width: 56, height: 4, borderRadius: 2, overflow: "hidden" },
  fill: { height: 4, borderRadius: 2 },
});
