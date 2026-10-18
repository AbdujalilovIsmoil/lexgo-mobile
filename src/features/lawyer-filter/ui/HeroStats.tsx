import { StyleSheet, View } from "react-native";
import { Icon, Text, type IconName } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { fmtMoney } from "@/shared/lib/money";

export type Stats = { sellers: number; services: number; min: number; loading: boolean };

// The hero's three counters on a frosted strip: specialists, services on sale, the cheapest one.
export function HeroStats({ stats }: { stats: Stats }) {
  const { t } = useT();
  const cells: { icon: IconName; v: string; k: string }[] = [
    { icon: "users", v: stats.loading ? "—" : String(stats.sellers), k: t("mkw.heroStats.sellers") },
    { icon: "briefcase", v: stats.loading ? "—" : String(stats.services), k: t("mkw.heroStats.services") },
    { icon: "credit-card", v: stats.min ? fmtMoney(stats.min) : "—", k: t("mkw.heroStats.from") },
  ];
  return (
    <View style={s.row}>
      {cells.map((x, i) => (
        <View key={x.k} style={[s.cell, i > 0 && s.sep]}>
          <View style={s.val}><Icon name={x.icon} size={15} color="#9FC4FF" /><Text variant="body" weight="bold" tone="white" numberOfLines={1}>{x.v}</Text></View>
          <Text variant="caption" style={s.k} numberOfLines={2}>{x.k}</Text>
        </View>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", borderRadius: 16, backgroundColor: "rgba(255,255,255,0.07)", borderWidth: 1, borderColor: "rgba(255,255,255,0.14)" },
  cell: { flex: 1, gap: 3, padding: 12 },
  sep: { borderLeftWidth: 1, borderLeftColor: "rgba(255,255,255,0.14)" },
  val: { flexDirection: "row", alignItems: "center", gap: 6 },
  k: { color: "#B7CDEC" },
});
