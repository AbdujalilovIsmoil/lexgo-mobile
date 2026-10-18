import { StyleSheet, View } from "react-native";
import type { Drill } from "@/entities/admin-dash";
import { MiniKpi } from "@/widgets/admin-dash";
import { Gauge, Text } from "@/shared/ui";
import { SectionCard } from "@/shared/ui/admin";
import type { CeoCtx } from "../lib/useCeoCtx";
import { drillUsers } from "../drills/main";
import { GrowthBar } from "./GrowthBar";

// "Auditoriya": how many people, how engaged (active share, DAU/MAU), who is new and how happy (NPS).
export function AudienceTab({ x, onOpen }: { x: CeoCtx; onOpen: (d: Drill) => void }) {
  const { t, fmt, c } = x;
  const go = (f: (x: CeoCtx) => Drill) => () => onOpen(x.withDemo(f(x)));
  const sign = (n?: number) => (n == null ? "—" : n > 0 ? `+${n}` : String(n));
  return (
    <View style={{ gap: 14 }}>
      <SectionCard title={t("admCeo.users")}>
        <Text variant="h2" style={s.big}>{fmt.int(c?.users)}</Text>
        <View style={s.row}>
          <Gauge value={c?.users ? c.activeUsers / c.users : 0} text={c?.users ? `${Math.round((c.activeUsers / c.users) * 100)}%` : "—"} label={`${fmt.int(c?.activeUsers)} ${t("admCeo.active")}`} color="#7A5CFF" />
          <Gauge value={c?.mau ? c.dau / c.mau : 0} text={c?.mau ? `${Math.round((c.dau / c.mau) * 100)}%` : "—"} label={t("admCeoV.stickiness")} color="#06B6D4" />
        </View>
      </SectionCard>
      <View style={s.row}>
        <MiniKpi index={0} icon="users" colors={["#7A5CFF", "#B7A4FF"]} label="MAU" value={fmt.int(c?.mau)} onPress={go(drillUsers)} />
        <MiniKpi index={1} icon="activity" colors={["#06B6D4", "#67E8F9"]} label="DAU" value={fmt.int(c?.dau)} onPress={go(drillUsers)} />
      </View>
      <GrowthBar x={x} onPress={go(drillUsers)} />
      <SectionCard title="NPS">
        <View style={s.row}>
          <Gauge value={((c?.npsClient ?? 0) + 100) / 200} text={sign(c?.npsClient)} label={t("admCeo.kpi.npsClient")} color="#F59E0B" />
          <Gauge value={((c?.npsAdvocate ?? 0) + 100) / 200} text={sign(c?.npsAdvocate)} label={t("admCeo.kpi.npsAdvocate")} color="#22C55E" />
        </View>
      </SectionCard>
    </View>
  );
}

const s = StyleSheet.create({ row: { flexDirection: "row", gap: 10 }, big: { fontSize: 38, lineHeight: 44, marginBottom: 6 } });
