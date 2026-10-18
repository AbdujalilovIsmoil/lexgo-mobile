import { Canvas, Circle } from "@shopify/react-native-skia";
import { useDerivedValue, type SharedValue } from "react-native-reanimated";

const COUNT = 22;
// Deterministic pseudo-random so the layout is stable between runs.
const rnd = (i: number, salt: number) => {
  const v = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return v - Math.floor(v);
};

function Sparkle({ i, w, h, time }: { i: number; w: number; h: number; time: SharedValue<number> }) {
  const phase = rnd(i, 3) * 2;
  const k = 2 + Math.floor(rnd(i, 4) * 4);
  const opacity = useDerivedValue(() => 0.05 + 0.6 * Math.abs(Math.sin((time.value * k + phase) * Math.PI * 2)));
  return <Circle cx={rnd(i, 1) * w} cy={rnd(i, 2) * h} r={0.8 + rnd(i, 5) * 1.8} color="#CFF4FF" opacity={opacity} />;
}

// Small twinkling stars scattered over the backdrop.
export function Sparkles({ w, h, time }: { w: number; h: number; time: SharedValue<number> }) {
  return (
    <Canvas pointerEvents="none" style={{ position: "absolute", width: w, height: h }}>
      {Array.from({ length: COUNT }).map((_, i) => (
        <Sparkle key={i} i={i} w={w} h={h} time={time} />
      ))}
    </Canvas>
  );
}
