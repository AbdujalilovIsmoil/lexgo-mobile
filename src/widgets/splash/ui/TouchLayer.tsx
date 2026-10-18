import { Canvas, Circle, RadialGradient, vec } from "@shopify/react-native-skia";
import { useDerivedValue } from "react-native-reanimated";
import type { useSplashTouch } from "../model/useSplashTouch";

type Touch = ReturnType<typeof useSplashTouch>;
type Ripple = Touch["ripples"][number];

function RippleRing({ r }: { r: Ripple }) {
  const c = useDerivedValue(() => vec(r.x.value, r.y.value));
  const radius = useDerivedValue(() => 12 + r.p.value * 260);
  const opacity = useDerivedValue(() => (1 - r.p.value) * 0.85);
  return <Circle c={c} r={radius} style="stroke" strokeWidth={2.5} color="#7FE3FF" opacity={opacity} />;
}

// Interactive light that follows the finger, plus tap ripples.
export function TouchLayer({ w, h, touch }: { w: number; h: number; touch: Touch }) {
  const { px, py, active, ripples } = touch;
  const c = useDerivedValue(() => vec(px.value, py.value));
  const opacity = useDerivedValue(() => active.value);
  return (
    <Canvas pointerEvents="none" style={{ position: "absolute", width: w, height: h }}>
      <Circle c={c} r={150} opacity={opacity}>
        <RadialGradient c={c} r={150} colors={["rgba(120,225,255,0.55)", "rgba(46,139,255,0)"]} />
      </Circle>
      {ripples.map((r, i) => (
        <RippleRing key={i} r={r} />
      ))}
    </Canvas>
  );
}
