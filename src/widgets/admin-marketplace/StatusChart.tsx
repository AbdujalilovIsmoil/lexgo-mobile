import { StyleSheet, View } from "react-native";
import { Canvas, Path, Skia } from "@shopify/react-native-skia";
import { PressableScale, Text } from "@/shared/ui";
import { SectionCard } from "@/shared/ui/admin";
import { statusColor, useMktLabels, type MktStats } from "@/entities/admin-marketplace";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";

const ORDER = ["completed", "paid", "pending_payment", "cancelled"];
const SIZE = 168;
const STROKE = 22;

// Orders by status as a ring with the total in its middle, and one tile per status under it (colour, count, share). A tile
// opens the Orders tab filtered by that status; a status with no orders is dimmed.
export function StatusChart({ stats, onStatus }: { stats: MktStats; onStatus: (status: string) => void }) {
  const { t } = useT();
  const c = useColors();
  const label = useMktLabels();
  const known = new Map(stats.byStatus.map((x) => [x.status, x.count]));
  const keys = [...ORDER, ...stats.byStatus.map((x) => x.status).filter((x) => !ORDER.includes(x))];
  const total = keys.reduce((n, k) => n + (known.get(k) ?? 0), 0);
  const rect = Skia.XYWHRect(STROKE / 2, STROKE / 2, SIZE - STROKE, SIZE - STROKE);
  const live = keys.filter((k) => known.get(k));
  const arcs = live.map((k, i) => {
    const before = live.slice(0, i).reduce((n, x) => n + (known.get(x) ?? 0), 0);
    const sweep = ((known.get(k) ?? 0) / total) * 360;
    return { k, path: Skia.PathBuilder.Make().addArc(rect, -90 + (before / total) * 360, Math.max(sweep - 2, 0.5)).build() };
  });
  return (
    <SectionCard title={t("admMkt.chart.title")}>
      {total ? (
        <>
          <View style={s.ring}>
            <Canvas style={{ width: SIZE, height: SIZE }}>
              <Path path={Skia.PathBuilder.Make().addArc(rect, 0, 359.9).build()} style="stroke" strokeWidth={STROKE} color={c.surface2} />
              {arcs.map((a) => <Path key={a.k} path={a.path} style="stroke" strokeWidth={STROKE} color={statusColor(a.k)} strokeCap="butt" />)}
            </Canvas>
            <View style={[StyleSheet.absoluteFill, s.mid]} pointerEvents="none">
              <Text variant="h2">{stats.ordersTotal}</Text>
              <Text variant="caption" tone="gray">{t("admMkt.kpi.total")}</Text>
            </View>
          </View>
          <View style={s.grid}>
            {keys.map((k) => {
              const n = known.get(k) ?? 0;
              const color = statusColor(k);
              return (
                <PressableScale key={k} onPress={() => onStatus(k)} accessibilityLabel={`${label.status(k)}: ${n}`} style={[s.tile, { backgroundColor: c.surface2, opacity: n ? 1 : 0.5 }]}>
                  <View style={[s.edge, { backgroundColor: color }]} />
                  <View style={s.fill}>
                    <Text variant="caption" tone="gray" numberOfLines={1}>{label.status(k)}</Text>
                    <View style={s.nums}>
                      <Text variant="body" weight="bold">{n}</Text>
                      <Text variant="caption" weight="semibold" style={{ color }}>{Math.round((n / total) * 1000) / 10}%</Text>
                    </View>
                  </View>
                </PressableScale>
              );
            })}
          </View>
        </>
      ) : (
        <Text variant="small" tone="gray">{t("admMkt.chart.empty")}</Text>
      )}
    </SectionCard>
  );
}

const s = StyleSheet.create({
  ring: { width: SIZE, height: SIZE, alignSelf: "center", marginVertical: 6 },
  mid: { alignItems: "center", justifyContent: "center" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  tile: { width: "48%", flexGrow: 1, height: 62, flexDirection: "row", alignItems: "center", gap: 10, paddingRight: 12, borderRadius: 16, overflow: "hidden" },
  edge: { width: 5, alignSelf: "stretch" },
  fill: { flex: 1, gap: 2 },
  nums: { flexDirection: "row", alignItems: "baseline", gap: 8 },
});
