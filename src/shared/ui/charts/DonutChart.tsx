import { StyleSheet, View } from "react-native";
import { Canvas, Path, Skia } from "@shopify/react-native-skia";
import { useColors } from "@/shared/theme";
import { Text } from "../Text";

export type Slice = { label: string; value: number; color: string };
const SIZE = 132;
const STROKE = 18;

// Share-of-total ring with a legend (channels, sources …). Slices with 0 are skipped.
export function DonutChart({ slices, format = (n) => String(Math.round(n)) }: { slices: Slice[]; format?: (n: number) => string }) {
  const c = useColors();
  const total = slices.reduce((n, x) => n + Math.max(x.value, 0), 0);
  const rect = Skia.XYWHRect(STROKE / 2, STROKE / 2, SIZE - STROKE, SIZE - STROKE);
  const live = slices.filter((x) => x.value > 0);
  const arcs = live.map((x, i) => {
    const before = live.slice(0, i).reduce((n, y) => n + y.value, 0);
    const sweep = (x.value / (total || 1)) * 360;
    return { ...x, path: Skia.PathBuilder.Make().addArc(rect, -90 + (before / (total || 1)) * 360, Math.max(sweep - 1.5, 0.5)).build() };
  });
  return (
    <View style={s.row}>
      <View style={{ width: SIZE, height: SIZE }}>
        <Canvas style={{ width: SIZE, height: SIZE }}>
          <Path path={Skia.PathBuilder.Make().addArc(rect, 0, 359.9).build()} style="stroke" strokeWidth={STROKE} color={c.surface2} />
          {arcs.map((a) => <Path key={a.label} path={a.path} style="stroke" strokeWidth={STROKE} color={a.color} strokeCap="butt" />)}
        </Canvas>
        <View style={[StyleSheet.absoluteFill, s.center]}><Text variant="h4">{format(total)}</Text></View>
      </View>
      <View style={s.legend}>
        {slices.map((x) => (
          <View key={x.label} style={s.leg}>
            <View style={[s.dot, { backgroundColor: x.color }]} />
            <Text variant="small" numberOfLines={1} style={s.legLabel}>{x.label}</Text>
            <Text variant="small" weight="bold">{total ? Math.round((x.value / total) * 100) : 0}%</Text>
          </View>
        ))}
      </View>
      <View />
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 16 },
  center: { alignItems: "center", justifyContent: "center" },
  legend: { flex: 1, gap: 8 },
  leg: { flexDirection: "row", alignItems: "center", gap: 8 },
  legLabel: { flex: 1 },
  dot: { width: 10, height: 10, borderRadius: 5 },
});
