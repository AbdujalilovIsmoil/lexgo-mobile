import { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Canvas, LinearGradient, Path, Skia, vec } from "@shopify/react-native-skia";
import { useColors } from "@/shared/theme";
import { Text } from "../Text";

export type Point = { x: string; y: number };
type Props = { data: Point[]; height?: number; color?: string; format?: (n: number) => string };

const PAD = 10;

// Smooth trend line with a soft fill. Touch or drag along it to read a value.
export function LineChart({ data, height = 150, color, format = (n) => String(Math.round(n)) }: Props) {
  const c = useColors();
  const tint = color ?? c.accent;
  const [w, setW] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const n = data.length;
  const geo = useMemo(() => {
    if (w <= 0 || n < 2) return null;
    const ys = data.map((p) => p.y);
    const min = Math.min(...ys, 0);
    const span = Math.max(...ys) - min || 1;
    const pts = data.map((p, i) => ({ x: PAD + (i * (w - PAD * 2)) / (n - 1), y: height - PAD - ((p.y - min) / span) * (height - PAD * 2) }));
    const b = Skia.PathBuilder.Make().moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < n; i++) {
      const mx = (pts[i - 1].x + pts[i].x) / 2;
      b.cubicTo(mx, pts[i - 1].y, mx, pts[i].y, pts[i].x, pts[i].y);
    }
    const line = b.build();
    const area = Skia.PathBuilder.MakeFromPath(line).lineTo(pts[n - 1].x, height).lineTo(pts[0].x, height).close().build();
    return { pts, line, area };
  }, [w, n, data, height]);
  const pick = (x: number) => setSel(Math.max(0, Math.min(n - 1, Math.round(((x - PAD) / Math.max(w - PAD * 2, 1)) * (n - 1)))));
  const cur = sel ?? n - 1;
  return (
    <View onLayout={(e) => setW(e.nativeEvent.layout.width)} style={s.wrap}>
      <View style={s.head}>
        <Text variant="h4">{n ? format(data[cur].y) : "—"}</Text>
        <Text variant="caption" tone="gray">{n ? data[cur].x : ""}</Text>
      </View>
      <View style={{ height }} onStartShouldSetResponder={() => true} onResponderGrant={(e) => pick(e.nativeEvent.locationX)} onResponderMove={(e) => pick(e.nativeEvent.locationX)} onResponderRelease={() => setSel(null)}>
        {geo ? (
          <Canvas style={{ width: w, height }} pointerEvents="none">
            <Path path={geo.area}><LinearGradient start={vec(0, 0)} end={vec(0, height)} colors={[`${tint}55`, `${tint}00`]} /></Path>
            <Path path={geo.line} style="stroke" strokeWidth={2.5} color={tint} strokeCap="round" strokeJoin="round" />
          </Canvas>
        ) : null}
        {geo ? <View pointerEvents="none" style={[s.dot, { left: geo.pts[cur].x - 5, top: geo.pts[cur].y - 5, backgroundColor: tint, borderColor: c.surface }]} /> : null}
      </View>
      {n > 1 ? <View style={s.axis}><Text variant="caption" tone="gray2">{data[0].x}</Text><Text variant="caption" tone="gray2">{data[n - 1].x}</Text></View> : null}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { gap: 6 },
  head: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between" },
  axis: { flexDirection: "row", justifyContent: "space-between" },
  dot: { position: "absolute", width: 10, height: 10, borderRadius: 5, borderWidth: 2 },
});
