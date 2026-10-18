import { BlurMask, Circle, vec } from "@shopify/react-native-skia";
import { useDerivedValue, type SharedValue } from "react-native-reanimated";

type Props = { phase: SharedValue<number>; size: number; i: number; color: string };

// A soft light that drifts around inside the orb's core.
export function OrbBlob({ phase, size, i, color }: Props) {
  const c = useDerivedValue(() => {
    const a = phase.value * (0.7 + i * 0.4) + i * 2.1;
    const r = size * 0.15;
    return vec(size / 2 + Math.cos(a) * r, size / 2 + Math.sin(a * 1.3) * r);
  });
  return (
    <Circle c={c} r={size * 0.17} color={color} blendMode="screen">
      <BlurMask blur={size * 0.07} style="normal" />
    </Circle>
  );
}
