import { useMemo } from "react";
import { Canvas, Circle, LinearGradient, Line, Path, Skia, vec } from "@shopify/react-native-skia";

type Props = { values: number[]; width: number; height: number; active: number | null };

const sparkX = (i: number, n: number, w: number): number => (n > 1 ? (i / (n - 1)) * w : w / 2);

// Smooth area + line over the revenue trend; `active` marks the point under the finger.
export function Sparkline({ values, width, height, active }: Props) {
  const pts = useMemo(() => {
    const lo = Math.min(...values, 0), hi = Math.max(...values, 1), pad = 8;
    return values.map((v, i) => ({ x: sparkX(i, values.length, width), y: pad + (1 - (v - lo) / Math.max(hi - lo, 1)) * (height - pad * 2) }));
  }, [values, width, height]);
  const { line, area } = useMemo(() => {
    const l = Skia.Path.Make();
    pts.forEach((p, i) => { if (!i) l.moveTo(p.x, p.y); else { const q = pts[i - 1], mx = (q.x + p.x) / 2; l.cubicTo(mx, q.y, mx, p.y, p.x, p.y); } });
    const a = l.copy();
    if (pts.length) { a.lineTo(pts[pts.length - 1].x, height); a.lineTo(pts[0].x, height); a.close(); }
    return { line: l, area: a };
  }, [pts, height]);
  const cur = active != null ? pts[active] : null;
  return (
    <Canvas style={{ width, height }}>
      <Path path={area}><LinearGradient start={vec(0, 0)} end={vec(0, height)} colors={["rgba(255,255,255,0.38)", "rgba(255,255,255,0)"]} /></Path>
      <Path path={line} style="stroke" strokeWidth={2.5} strokeCap="round" color="#fff" />
      {cur ? <Line p1={vec(cur.x, 0)} p2={vec(cur.x, height)} color="rgba(255,255,255,0.5)" strokeWidth={1} /> : null}
      {cur ? <Circle cx={cur.x} cy={cur.y} r={5.5} color="#fff" /> : null}
    </Canvas>
  );
}
