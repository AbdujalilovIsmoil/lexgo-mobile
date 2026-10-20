import { StyleSheet, View } from "react-native";
import { GradientBox, IconButton, LiveDot, PressableScale, Text } from "@/shared/ui";
import type { MktStats } from "@/entities/admin-marketplace";
import { fmtMoney } from "@/shared/lib/money";
import { fmtTime } from "@/shared/lib/format";
import { useT } from "@/shared/i18n";

export type MktTab = "overview" | "orders" | "sellers";
type Props = {
  stats?: MktStats;
  updatedAt: number;
  scope: string;
  tab: MktTab;
  onTab: (tab: MktTab) => void;
  busy: boolean;
  failed: boolean;
  onRefresh: () => void;
};

const WHITE = "#FFFFFF";
const SOFT = "rgba(255,255,255,0.72)";

// The monitor's entrance, like the web's: a live line (dot, "refreshes every minute", last update), the title and lead, the
// paid revenue of the current scope, and the tabs with their counters plus a refresh button.
export function MktHero({ stats, updatedAt, scope, tab, onTab, busy, failed, onRefresh }: Props) {
  const { t } = useT();
  const counts: Partial<Record<MktTab, number>> = { orders: stats?.ordersTotal, sellers: stats?.sellersCount };
  return (
    <GradientBox variant="dark" round={26} style={s.box}>
      <View style={s.glow} pointerEvents="none" />
      <View style={s.live}>
        <LiveDot color={failed ? "#F87171" : "#34D399"} size={7} />
        <Text variant="caption" weight="semibold" numberOfLines={1} style={[s.fill, { color: SOFT }]}>{t("admMkt.eyebrow")}</Text>
        {updatedAt ? <Text variant="caption" style={{ color: SOFT }}>{fmtTime(new Date(updatedAt).toISOString())}</Text> : null}
      </View>
      <View style={s.titles}>
        <Text variant="h2" numberOfLines={2} style={{ color: WHITE }}>{t("admHub.mod.marketplace.title")}</Text>
        <Text variant="small" style={{ color: SOFT }}>{t("admMkt.lead")}</Text>
      </View>
      <View style={[s.rev, busy && s.busy]}>
        <Text variant="kicker" style={{ color: SOFT }}>{t("admMkt.revenue")}</Text>
        <View style={s.amount}>
          <Text variant="h2" numberOfLines={1} adjustsFontSizeToFit style={[s.fill, s.big, { color: WHITE }]}>{stats ? fmtMoney(stats.revenuePaid) : "—"}</Text>
          <Text variant="small" weight="semibold" style={{ color: SOFT }}>{t("adm.currency")}</Text>
        </View>
        <Text variant="small" style={{ color: SOFT }}>{stats ? t("admMkt.revenueSub", { n: stats.paidOrders }) : " "}</Text>
        <Text variant="caption" numberOfLines={2} style={{ color: "rgba(255,255,255,0.55)" }}>{scope}</Text>
      </View>
      <View style={s.bar}>
        <View style={s.tabs} accessibilityRole="tablist">
          {(["overview", "orders", "sellers"] as const).map((k) => {
            const on = tab === k;
            const n = counts[k];
            return (
              <PressableScale key={k} haptic={false} scale={0.97} accessibilityRole="tab" accessibilityState={{ selected: on }} onPress={() => onTab(k)} style={[s.tab, on && s.tabOn]}>
                <Text variant="caption" weight="bold" numberOfLines={1} adjustsFontSizeToFit style={{ color: on ? "#0B1E45" : WHITE }}>{t(`admMkt.tabs.${k}`)}</Text>
                {typeof n === "number" ? <Text variant="caption" weight="bold" style={{ color: on ? "#1668F0" : SOFT }}>{n}</Text> : null}
              </PressableScale>
            );
          })}
        </View>
        <IconButton icon="refresh-cw" size={44} label={t("adm.refresh")} onPress={() => { if (!busy) onRefresh(); }} />
      </View>
    </GradientBox>
  );
}

const s = StyleSheet.create({
  box: { padding: 16, gap: 14 },
  glow: { position: "absolute", top: -70, right: -50, width: 220, height: 220, borderRadius: 110, backgroundColor: "rgba(59,130,246,0.28)" },
  fill: { flex: 1 },
  live: { flexDirection: "row", alignItems: "center", gap: 6 },
  titles: { gap: 4 },
  rev: { gap: 3, padding: 14, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.09)", borderWidth: 1, borderColor: "rgba(255,255,255,0.14)" },
  busy: { opacity: 0.6 },
  big: { fontSize: 32, lineHeight: 38 },
  amount: { flexDirection: "row", alignItems: "baseline", gap: 6 },
  bar: { flexDirection: "row", alignItems: "center", gap: 8 },
  tabs: { flex: 1, flexDirection: "row", gap: 2, padding: 4, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.12)" },
  tab: { flex: 1, minHeight: 44, borderRadius: 14, alignItems: "center", justifyContent: "center", paddingHorizontal: 2 },
  tabOn: { backgroundColor: WHITE },
});
