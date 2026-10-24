import { Circle, RadialGradient } from "@shopify/react-native-skia";
import { useDerivedValue, type SharedValue } from "react-native-reanimated";

type Props = { phase: SharedValue<number>; size: number; i: number; color: string };

// A soft light that drifts around inside the orb's core. A radial gradient fading to transparent stands in for a blur: it costs
// one cheap fill per frame instead of re-blurring a layer.
export function OrbBlob({ phase, size, i, color }: Props) {
  const x = useDerivedValue(() => size / 2 + Math.cos(phase.value * (0.7 + i * 0.4) + i * 2.1) * size * 0.15);
  const y = useDerivedValue(() => size / 2 + Math.sin((phase.value * (0.7 + i * 0.4) + i * 2.1) * 1.3) * size * 0.15);
  const c = useDerivedValue(() => ({ x: x.value, y: y.value }));
  const r = size * 0.24;
  return (
    <Circle c={c} r={r} blendMode="screen">
      <RadialGradient c={c} r={r} colors={[color, "rgba(0,0,0,0)"]} />
    </Circle>
  );
}
