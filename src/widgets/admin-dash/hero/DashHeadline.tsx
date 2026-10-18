import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import type { Drill } from "@/entities/admin-dash";
import type { DashCtx } from "../lib/useDashCtx";
import { drillMrr } from "../drills/money";
import { drillConversion, drillUsers } from "../drills/people";
import { MiniKpi } from "./MiniKpi";
import { RevenueHero } from "./RevenueHero";

// The four headline numbers: revenue hero with a scrubbable trend + MRR, users and conversion cards.
export function DashHeadline({ x, onOpen }: { x: DashCtx; onOpen: (d: Drill) => void }) {
  const { t, fmt, c } = x;
  const router = useRouter();
  const [w, setW] = useState(0);
  const go = (f: (x: DashCtx) => Drill) => () => onOpen(x.withDemo(f(x)));
  const act = c && c.users ? c.activeUsers / c.users : undefined;
  return (
    <View style={s.col} onLayout={(e) => setW(e.nativeEvent.layout.width)}>
      {w > 0 ? <RevenueHero x={x} width={w} onOpen={() => router.push("/manage/revenue" as never)} /> : null}
      <View style={s.row}>
        <MiniKpi index={0} icon="trending-up" colors={["#16A34A", "#4ADE80"]} label={t("admDashC.crm.mrr")} value={fmt.short(c?.mrr)} onPress={go(drillMrr)} />
        <MiniKpi index={1} icon="users" colors={["#7A5CFF", "#B7A4FF"]} label={t("admDashC.crm.users")} value={fmt.int(c?.users)} ratio={act} onPress={go(drillUsers)} />
        <MiniKpi index={2} icon="target" colors={["#F59E0B", "#FCD34D"]} label={t("admDashC.crm.conversion")} value={fmt.pct(c?.conversionPct)} ratio={c ? c.conversionPct / 100 : undefined} onPress={go(drillConversion)} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({ col: { gap: 10 }, row: { flexDirection: "row", gap: 10 } });
