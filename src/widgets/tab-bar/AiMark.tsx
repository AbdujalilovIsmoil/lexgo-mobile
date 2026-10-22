import { useEffect, useMemo } from "react";
import { Canvas, Circle, Group, LinearGradient, Path, Skia, vec } from "@shopify/react-native-skia";
import { Easing, useDerivedValue, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";

type Props = { size: number; calm?: boolean };

// The AI mark, drawn live on a Skia canvas: scales of justice whose beam is the AI spark. Every few seconds it is drawn again line by
// line — the spark, the pillar, the base, the strings, the pans — then fills in white, holds, and fades. `calm` (Reduce Motion) shows
// it finished and still. Coordinates are in a 552-unit square, scaled to `size`.
const U = 552;
const CX = 276;
const TY = 200; // the spark's centre (the beam's height)
const R = 112;
const TIP = R + 14; // pans hang from the spark's left and right tips
const CYCLE = 10000;

function sparkPath() {
  const p = Skia.Path.Make();
  const n = 48, e = 2 / 0.62;
  for (let i = 0; i < 4 * n; i++) {
    const a = (2 * Math.PI * i) / (4 * n);
    const c = Math.cos(a), s = Math.sin(a);
    const x = CX + Math.sign(c) * Math.abs(c) ** e * R, y = TY + Math.sign(s) * Math.abs(s) ** e * R;
    if (i === 0) p.moveTo(x, y); else p.lineTo(x, y);
  }
  return p.close();
}
const line = (x1: number, y1: number, x2: number, y2: number) => Skia.Path.Make().moveTo(x1, y1).lineTo(x2, y2);
const pan = (cx: number) => Skia.Path.Make().addArc({ x: cx - 68, y: 330 - 56, width: 136, height: 112 }, 0, 180).close();

type Part = { path: ReturnType<typeof Skia.Path.Make>; width: number; at: number; fill?: boolean };

const clamp = (v: number) => { "worklet"; return Math.min(1, Math.max(0, v)); };

export function AiMark({ size, calm = false }: Props) {
  const t = useSharedValue(calm ? 0.5 : 0);
  useEffect(() => {
    if (calm) { t.value = 0.5; return; }
    t.value = withRepeat(withTiming(1, { duration: CYCLE, easing: Easing.linear }), -1);
  }, [calm, t]);

  const parts = useMemo<Part[]>(() => {
    const out: Part[] = [{ path: sparkPath(), width: 14, at: 0, fill: true }];
    out.push({ path: line(CX, TY + 62, CX, 438), width: 28, at: 0.06 });
    out.push({ path: line(204, 442, 348, 442), width: 32, at: 0.1 });
    for (const [i, tx] of [CX - TIP, CX + TIP].entries()) {
      out.push({ path: line(tx, TY, tx - 52, 330), width: 13, at: 0.13 + i * 0.01 });
      out.push({ path: line(tx, TY, tx + 52, 330), width: 13, at: 0.135 + i * 0.01 });
      out.push({ path: pan(tx), width: 12, at: 0.16 + i * 0.015, fill: true });
    }
    return out;
  }, []);

  const fill = useDerivedValue(() => clamp((t.value - 0.25) / 0.06) * (1 - clamp((t.value - 0.9) / 0.08)));
  const fade = useDerivedValue(() => 1 - clamp((t.value - 0.9) / 0.08));
  const k = size / U;
  return (
    <Canvas style={{ width: size, height: size }} pointerEvents="none">
      <Group transform={[{ scale: k }]}>
        <Circle cx={U / 2} cy={U / 2} r={U / 2 - 12}>
          <LinearGradient start={vec(120, 0)} end={vec(430, U)} colors={["#1668F0", "#00A6E6", "#00CFE8"]} positions={[0, 0.62, 1]} />
        </Circle>
        {parts.map((p, i) => <Stroke key={i} part={p} t={t} fade={fade} />)}
        {parts.filter((p) => p.fill).map((p, i) => <Path key={`f${i}`} path={p.path} color="white" opacity={fill} />)}
      </Group>
    </Canvas>
  );
}

function Stroke({ part, t, fade }: { part: Part; t: ReturnType<typeof useSharedValue<number>>; fade: ReturnType<typeof useDerivedValue<number>> }) {
  const end = useDerivedValue(() => clamp((t.value - part.at) / 0.1));
  return <Path path={part.path} style="stroke" strokeWidth={part.width} strokeCap="round" strokeJoin="round" color="white" start={0} end={end} opacity={fade} />;
}
