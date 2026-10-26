import { useEffect, useMemo } from "react";
import { View } from "react-native";
import { Canvas, Circle, Group, LinearGradient, Path, RadialGradient, Skia, vec } from "@shopify/react-native-skia";
import { AiCore3D } from "./AiCore3D";
import { Easing, cancelAnimation, useDerivedValue, useSharedValue, withSequence, withTiming, type SharedValue } from "react-native-reanimated";

type Props = { size: number; calm?: boolean; paused?: boolean }; // paused: kept alive (canvas and GL context stay) but not animating

// The AI mark, drawn live on a Skia canvas: a constellation of neuron nodes joined into a four-point spark. Each time it comes into view
// the links are drawn node to node around the spark, the spokes reach the core, the nodes light up, the spark fills with a soft glow and a
// pulse of "thought" runs around the network until it fades; then it is drawn once more and rests on that finished frame. A small
// three.js crystal (AiCore3D) turns in the core meanwhile. One play, not a loop: a loop kept the GPU, the JS thread and the 120 Hz display
// busy for as long as any tab page was open. `calm` (Reduce Motion) shows the finished frame only.
// Coordinates are in a 552-unit square, scaled to `size`.
const U = 552;
const C = U / 2;
const TIP = 190; // tip radius of the spark
const INNER = 74; // radius of its inner corners
const CYCLE = 10000;
const REST = 0.38; // the finished frame: every link, node and the glow drawn, the pulse not yet out
export const MARK_PLAY_MS = CYCLE * (1 + REST); // one full cycle, then the draw-in to REST
const SEG = 0.026; // delay between successive links when drawing

const V = Array.from({ length: 8 }, (_, k) => {
  const a = (k * Math.PI) / 4, r = k % 2 === 0 ? TIP : INNER;
  return { x: C + Math.sin(a) * r, y: C - Math.cos(a) * r, tip: k % 2 === 0 };
});
const clamp = (v: number) => { "worklet"; return Math.min(1, Math.max(0, v)); };
const seg = (x1: number, y1: number, x2: number, y2: number) => Skia.Path.Make().moveTo(x1, y1).lineTo(x2, y2);

export function AiMark({ size, calm = false, paused = false }: Props) {
  const t = useSharedValue(calm ? REST : 0);
  useEffect(() => {
    if (calm) { t.value = REST; return; }
    if (paused) { cancelAnimation(t); return; }
    t.value = 0; // drawn afresh each time it comes back into view
    const linear = Easing.linear;
    t.value = withSequence(withTiming(1, { duration: CYCLE, easing: linear }), withTiming(0, { duration: 0 }), withTiming(REST, { duration: REST * CYCLE, easing: linear }));
    return () => cancelAnimation(t);
  }, [calm, paused, t]);

  const star = useMemo(() => { const p = Skia.Path.Make().moveTo(V[0].x, V[0].y); V.slice(1).forEach((v) => p.lineTo(v.x, v.y)); return p.close(); }, []);
  const edges = useMemo(() => V.map((v, i) => seg(v.x, v.y, V[(i + 1) % 8].x, V[(i + 1) % 8].y)), []);
  const spokes = useMemo(() => V.filter((v) => v.tip).map((v) => seg(C, C, v.x, v.y)), []);

  const fade = useDerivedValue(() => 1 - clamp((t.value - 0.9) / 0.08));
  const glow = useDerivedValue(() => 0.2 * clamp((t.value - 0.3) / 0.08) * fade.value);
  // the pulse runs round the outline from 0.38 to 0.9 (three laps)
  const pulse = useDerivedValue(() => {
    const u = ((clamp((t.value - 0.38) / 0.52) * 3) % 1) * 8;
    const i = Math.min(7, Math.floor(u)), f = u - i, a = V[i], b = V[(i + 1) % 8];
    return vec(a.x + (b.x - a.x) * f, a.y + (b.y - a.y) * f);
  });
  const pulseOn = useDerivedValue(() => clamp((t.value - 0.38) / 0.03) * fade.value);
  const k = size / U;
  return (
    <View style={{ width: size, height: size }} pointerEvents="none">
    <Canvas style={{ width: size, height: size }}>
      <Group transform={[{ scale: k }]}>
        <Circle cx={C} cy={C} r={C - 12}>
          <LinearGradient start={vec(120, 0)} end={vec(430, U)} colors={["#1668F0", "#00A6E6", "#00CFE8"]} positions={[0, 0.62, 1]} />
        </Circle>
        <Path path={star} color="white" opacity={glow} />
        {edges.map((p, i) => <Link key={`e${i}`} path={p} width={12} at={i * SEG} win={0.07} t={t} fade={fade} />)}
        {spokes.map((p, i) => <Link key={`s${i}`} path={p} width={7} at={0.2 + i * 0.016} win={0.08} t={t} fade={fade} soft />)}
        {V.map((v, i) => <Node key={`n${i}`} x={v.x} y={v.y} r={v.tip ? 27 : 17} at={i * SEG + 0.03} t={t} fade={fade} />)}
        <Node x={C} y={C} r={36} at={0.26} t={t} fade={fade} />
        <Circle c={pulse} r={44} opacity={pulseOn}><RadialGradient c={pulse} r={44} colors={["rgba(255,255,255,0.85)", "rgba(255,255,255,0)"]} /></Circle>
        <Circle c={pulse} r={15} color="white" opacity={pulseOn} />
      </Group>
    </Canvas>
    <AiCore3D size={size * 0.6} t={t} calm={calm} paused={paused} playMs={MARK_PLAY_MS} />
    </View>
  );
}

type TV = SharedValue<number>;

function Link({ path, width, at, win, t, fade, soft }: { path: ReturnType<typeof seg>; width: number; at: number; win: number; t: TV; fade: TV; soft?: boolean }) {
  const end = useDerivedValue(() => clamp((t.value - at) / win));
  const o = useDerivedValue(() => (soft ? 0.7 : 1) * fade.value);
  return <Path path={path} style="stroke" strokeWidth={width} strokeCap="round" color="white" start={0} end={end} opacity={o} />;
}

// A node pops in (a little overshoot) when its links arrive.
function Node({ x, y, r, at, t, fade }: { x: number; y: number; r: number; at: number; t: TV; fade: TV }) {
  const rr = useDerivedValue(() => { const p = clamp((t.value - at) / 0.05); return r * p * (1 + 0.25 * Math.sin(p * Math.PI)); });
  const o = useDerivedValue(() => clamp((t.value - at) / 0.02) * fade.value);
  return <Circle cx={x} cy={y} r={rr} color="white" opacity={o} />;
}
