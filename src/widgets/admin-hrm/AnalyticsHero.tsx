import { StyleSheet } from "react-native";
import { Card, Gauge } from "@/shared/ui";
import type { AnalyticsBlock } from "@/entities/admin-hrm";
import { useT } from "@/shared/i18n";

const val = (bs: AnalyticsBlock[], b: string, k: string) => bs.find((x) => x.key === b)?.values.find((v) => v.key === k)?.value;
const PAIRS: { block: string; part: string; whole: string; color: string }[] = [
  { block: "employees", part: "active", whole: "total", color: "#06B6D4" },
  { block: "attendance_today", part: "present", whole: "total", color: "#22C55E" },
  { block: "execution", part: "done", whole: "total", color: "#F59E0B" },
];

// Top of the analytics page: a gauge per block that has a part / whole pair (active staff, present today, tasks done).
export function AnalyticsHero({ blocks }: { blocks: AnalyticsBlock[] }) {
  const { t } = useT();
  const gauges = PAIRS.map((p) => ({ ...p, a: val(blocks, p.block, p.part), w: val(blocks, p.block, p.whole) })).filter((p) => p.a != null && p.w);
  if (!gauges.length) return null;
  return (
    <Card style={s.card}>
      {gauges.map((g) => <Gauge key={g.block} size={112} value={(g.a ?? 0) / (g.w ?? 1)} text={`${g.a}/${g.w}`} label={t(`admHrmC.an.${g.block}`)} color={g.color} />)}
    </Card>
  );
}

const s = StyleSheet.create({ card: { padding: 12, flexDirection: "row", gap: 4 } });
