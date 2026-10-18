import { StyleSheet, View } from "react-native";
import { Card, Icon, Text } from "@/shared/ui";
import { adColor, adLabel, usedStatuses, type Ad } from "@/entities/admin-ads";
import { fmtCompact } from "@/shared/lib/money";
import { useT } from "@/shared/i18n";

// Headline of the ads desk: how many products, how many are live, their combined price and the status mix as one bar.
export function AdsHero({ ads }: { ads: Ad[] }) {
  const { t } = useT();
  const live = ads.filter((a) => a.status === "active");
  const sum = live.reduce((n, a) => n + a.price, 0);
  const used = usedStatuses(ads);
  const count = (st: string) => ads.filter((a) => a.status === st).length;
  return (
    <Card style={s.card}>
      <View style={s.top}>
        <View style={s.cell}><Text variant="h2">{ads.length}</Text><Text variant="caption" tone="gray">{t("admAdsB.total")}</Text></View>
        <View style={s.cell}><View style={s.row}><Icon name="check-circle" size={16} color="#22C55E" /><Text variant="h2">{live.length}</Text></View><Text variant="caption" tone="gray">{adLabel(t, "status", "active")}</Text></View>
        <View style={s.cell}><Text variant="h2" numberOfLines={1} adjustsFontSizeToFit>{fmtCompact(sum)}</Text><Text variant="caption" tone="gray">{t("admAdsB.liveSum")}</Text></View>
      </View>
      <View style={s.bar}>{used.map((st) => <View key={st} style={{ flex: count(st), backgroundColor: adColor(st) }} />)}</View>
      <View style={s.legend}>
        {used.map((st) => <View key={st} style={s.row}><View style={[s.dot, { backgroundColor: adColor(st) }]} /><Text variant="caption" tone="gray">{adLabel(t, "status", st)} {count(st)}</Text></View>)}
      </View>
    </Card>
  );
}

const s = StyleSheet.create({
  card: { padding: 14, gap: 12 },
  top: { flexDirection: "row", gap: 8 },
  cell: { flex: 1, gap: 2 },
  row: { flexDirection: "row", alignItems: "center", gap: 5 },
  bar: { flexDirection: "row", height: 12, borderRadius: 6, overflow: "hidden", gap: 2 },
  legend: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  dot: { width: 8, height: 8, borderRadius: 4 },
});
