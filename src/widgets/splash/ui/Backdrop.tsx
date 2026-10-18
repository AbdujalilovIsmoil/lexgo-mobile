import { Canvas, Circle, LinearGradient, RadialGradient, Rect, vec } from "@shopify/react-native-skia";
import { useDerivedValue, type SharedValue } from "react-native-reanimated";

type Props = { w: number; h: number; time: SharedValue<number>; tx: SharedValue<number>; ty: SharedValue<number>; bg: SharedValue<number> };

const ORBS = [
  { x: 0.15, y: 0.18, r: 0.55, c: "rgba(0,207,232,0.34)", k: 1, ph: 0, depth: 30 },
  { x: 0.9, y: 0.45, r: 0.5, c: "rgba(22,104,240,0.45)", k: 2, ph: 0.3, depth: 22 },
  { x: 0.3, y: 0.9, r: 0.6, c: "rgba(46,139,255,0.34)", k: 1, ph: 0.6, depth: 38 },
];

function Orb({ o, w, h, time, tx, ty }: { o: (typeof ORBS)[number] } & Omit<Props, "bg">) {
  const c = useDerivedValue(() => {
    const a = (time.value * o.k + o.ph) * Math.PI * 2;
    return vec(o.x * w + Math.sin(a) * 26 - tx.value * o.depth, o.y * h + Math.cos(a) * 30 - ty.value * o.depth);
  });
  const r = o.r * w;
  return (
    <Circle c={c} r={r}>
      <RadialGradient c={c} r={r} colors={[o.c, "rgba(3,16,43,0)"]} />
    </Circle>
  );
}

// Deep navy gradient with three slow drifting glow orbs (parallax on touch).
export function Backdrop({ w, h, time, tx, ty, bg }: Props) {
  const opacity = useDerivedValue(() => bg.value);
  return (
    <Canvas style={{ position: "absolute", width: w, height: h }}>
      <Rect x={0} y={0} width={w} height={h} opacity={opacity}>
        <LinearGradient start={vec(0, 0)} end={vec(w * 0.6, h)} colors={["#03102B", "#0B1F45", "#123A86"]} positions={[0, 0.55, 1]} />
      </Rect>
      {ORBS.map((o, i) => (
        <Orb key={i} o={o} w={w} h={h} time={time} tx={tx} ty={ty} />
      ))}
    </Canvas>
  );
}
